import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type {
  EntryStatus,
  EntryViewModel,
  GameSummary,
  GameType,
  ProfileUser,
  UserSummary,
} from '../api/types'
import {
  GAME_TYPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_OPTIONS,
  STATUS_SORT_ORDER,
  coverUrl,
} from '../api/labels'
import { useSession } from '../session/SessionProvider'
import { Avatar } from '../components/Avatar'
import { StatusIcon } from '../components/StatusIcon'
import { EntryRow } from '../components/EntryRow'
import { UserRow } from '../components/UserRow'
import './profile.css'

type ProfileTab = 'overview' | 'list' | 'followers' | 'following'

const STATUS_GROUPS = [...STATUS_OPTIONS].sort(
  (a, b) => STATUS_SORT_ORDER[a] - STATUS_SORT_ORDER[b],
)

interface Item {
  entry: EntryViewModel
  game: GameSummary | null
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: Item[] }

interface FollowState {
  isSelf: boolean
  isFollowing: boolean
  followers: number
  following: number
}

function Donut({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const size = 132
  const thickness = 16
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, seg) => sum + seg.value, 0)

  let offset = 0

  return (
    <div className="donut">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="donut__svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--seg-track)"
          strokeWidth={thickness}
        />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {total > 0 &&
            segments
              .filter((seg) => seg.value > 0)
              .map((seg) => {
                const dash = (seg.value / total) * circumference
                const element = (
                  <circle
                    key={seg.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={thickness}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="round"
                  />
                )
                offset += dash
                return element
              })}
        </g>
        <text x="50%" y="47%" className="donut__total" textAnchor="middle">
          {total}
        </text>
        <text x="50%" y="62%" className="donut__caption" textAnchor="middle">
          games
        </text>
      </svg>
      <ul className="donut__legend">
        {segments.map((seg) => (
          <li key={seg.label}>
            <span className="donut__dot" style={{ background: seg.color }} />
            <span className="donut__label">{seg.label}</span>
            <span className="donut__value">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Histogram({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts)
  return (
    <div className="hist">
      {counts.map((count, index) => (
        <div className="hist__col" key={index} title={`${count} rated ${index + 1}`}>
          <div className="hist__bar-track">
            <div className="hist__bar" style={{ height: `${(count / max) * 100}%` }} />
          </div>
          <span className="hist__tick">{index + 1}</span>
        </div>
      ))}
    </div>
  )
}

function RankBars({ rows }: { rows: { label: string; value: number }[] }) {
  if (rows.length === 0) {
    return <p className="chart-empty">No data yet.</p>
  }
  const max = Math.max(...rows.map((r) => r.value))
  return (
    <ul className="rank">
      {rows.map((row) => (
        <li className="rank__row" key={row.label}>
          <span className="rank__label" title={row.label}>
            {row.label}
          </span>
          <span className="rank__track">
            <span className="rank__fill" style={{ width: `${(row.value / max) * 100}%` }} />
          </span>
          <span className="rank__value">{row.value}</span>
        </li>
      ))}
    </ul>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function ActivityFeed({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="chart-empty">No activity yet.</p>
  }
  return (
    <ul className="activity-list">
      {items.map(({ entry, game }) => {
        const src = coverUrl(game?.coverUrl ?? null)
        return (
          <li key={entry.id}>
            <Link className="activity" to={game ? `/game/${game.id}` : '#'}>
              <span className="activity__cover">
                {src ? <img src={src} alt="" loading="lazy" /> : <span className="activity__noart" />}
              </span>
              <span className="activity__body">
                <span className="activity__title">{game?.name ?? 'Unknown game'}</span>
                <span className="activity__meta">
                  <span
                    className="activity__status"
                    style={{ '--status-color': STATUS_COLOR[entry.status] } as CSSProperties}
                  >
                    <StatusIcon status={entry.status} className="activity__status-icon" />
                    {STATUS_LABEL[entry.status]}
                  </span>
                  {entry.rating != null && (
                    <span className="activity__rating">★ {entry.rating}</span>
                  )}
                </span>
              </span>
              <time className="activity__time">{timeAgo(entry.updatedAt)}</time>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function Favorites({ games }: { games: GameSummary[] }) {
  if (games.length === 0) {
    return null
  }
  return (
    <div className="profile__favorites chart-card">
      <h2 className="chart-card__title">Favorites</h2>
      <div className="fav-grid">
        {games.map((game) => {
          const src = coverUrl(game.coverUrl)
          return (
            <Link key={game.id} to={`/game/${game.id}`} className="fav-cover" title={game.name}>
              {src ? (
                <img src={src} alt={game.name} loading="lazy" />
              ) : (
                <span className="fav-cover__noart" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function GenreTags({ rows }: { rows: { label: string; value: number }[] }) {
  if (rows.length === 0) {
    return <p className="chart-empty">No data yet.</p>
  }
  const max = Math.max(...rows.map((r) => r.value))
  return (
    <ul className="genre-tags">
      {rows.map((row) => (
        <li
          className="genre-tag"
          key={row.label}
          style={{ '--t': (row.value / max).toFixed(3) } as CSSProperties}
        >
          <span className="genre-tag__name">{row.label}</span>
          <span className="genre-tag__count">{row.value}</span>
        </li>
      ))}
    </ul>
  )
}

type ListSort = 'title' | 'rating' | 'updated'

const LIST_SORTS: { key: ListSort; label: string }[] = [
  { key: 'title', label: 'Title' },
  { key: 'rating', label: 'Highest rated' },
  { key: 'updated', label: 'Last updated' },
]

function sortItems(pItems: Item[], pSort: ListSort): Item[] {
  const xItems = [...pItems]
  switch (pSort) {
    case 'rating':
      xItems.sort(
        (a, b) =>
          (b.entry.rating ?? -1) - (a.entry.rating ?? -1) ||
          (a.game?.name ?? '').localeCompare(b.game?.name ?? '', undefined, { sensitivity: 'base' }),
      )
      break
    case 'updated':
      xItems.sort(
        (a, b) => new Date(b.entry.updatedAt).getTime() - new Date(a.entry.updatedAt).getTime(),
      )
      break
    default:
      xItems.sort((a, b) =>
        (a.game?.name ?? '').localeCompare(b.game?.name ?? '', undefined, { sensitivity: 'base' }),
      )
  }
  return xItems
}

function EntryList({ items, favoriteIds }: { items: Item[]; favoriteIds: Set<number> }) {
  return (
    <div className="lib-list">
      {items.map(({ entry, game }) => (
        <EntryRow
          key={entry.id}
          to={game ? `/game/${game.id}` : '#'}
          title={game?.name ?? `Game #${entry.id}`}
          status={entry.status}
          rating={entry.rating}
          cover={game?.coverUrl ?? null}
          favorite={game != null && favoriteIds.has(game.id)}
        />
      ))}
    </div>
  )
}

function GroupedList({ items, favoriteIds }: { items: Item[]; favoriteIds: Set<number> }) {
  return (
    <div className="profile__list">
      {STATUS_GROUPS.map((status) => {
        const groupItems = items.filter((item) => item.entry.status === status)
        if (groupItems.length === 0) return null
        return (
          <section
            className="profile-group"
            key={status}
            style={{ '--status-color': STATUS_COLOR[status] } as CSSProperties}
          >
            <h2 className="profile-group__head">
              <StatusIcon status={status} className="profile-group__icon" />
              <span className="profile-group__name">{STATUS_LABEL[status]}</span>
              <span className="profile-group__count">{groupItems.length}</span>
            </h2>
            <EntryList items={groupItems} favoriteIds={favoriteIds} />
          </section>
        )
      })}
    </div>
  )
}

function ProfileListView({ items, favoriteIds }: { items: Item[]; favoriteIds: Set<number> }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<EntryStatus | 'all'>('all')
  const [format, setFormat] = useState<GameType | 'all'>('all')
  const [genre, setGenre] = useState<string>('all')
  const [minRating, setMinRating] = useState(0)
  const [year, setYear] = useState(0)
  const [sort, setSort] = useState<ListSort>('title')

  const statusCounts = useMemo(() => {
    const counts = {} as Record<EntryStatus, number>
    for (const s of STATUS_OPTIONS) counts[s] = 0
    for (const { entry } of items) counts[entry.status] += 1
    return counts
  }, [items])

  const formats = useMemo(() => {
    const set = new Set<GameType>()
    for (const { game } of items) if (game) set.add(game.type)
    return [...set].sort((a, b) => a - b)
  }, [items])

  const genres = useMemo(() => {
    const set = new Set<string>()
    for (const { game } of items) for (const g of game?.genres ?? []) set.add(g.name)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [items])

  const [minYear, maxYear] = useMemo(() => {
    const years = items
      .map(({ game }) => (game?.releaseDate ? new Date(game.releaseDate).getFullYear() : null))
      .filter((y): y is number => y != null)
    return years.length ? [Math.min(...years), Math.max(...years)] : [0, 0]
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(({ entry, game }) => {
      if (q && !(game?.name ?? '').toLowerCase().includes(q)) return false
      if (status !== 'all' && entry.status !== status) return false
      if (format !== 'all' && game?.type !== format) return false
      if (genre !== 'all' && !(game?.genres ?? []).some((g) => g.name === genre)) return false
      if (minRating > 0 && (entry.rating ?? 0) < minRating) return false
      if (year > 0) {
        const y = game?.releaseDate ? new Date(game.releaseDate).getFullYear() : null
        if (y == null || y < year) return false
      }
      return true
    })
  }, [items, query, status, format, genre, minRating, year])

  const sorted = useMemo(() => sortItems(filtered, sort), [filtered, sort])

  const hasFilters =
    query.trim() !== '' ||
    status !== 'all' ||
    format !== 'all' ||
    genre !== 'all' ||
    minRating > 0 ||
    year > 0

  function reset() {
    setQuery('')
    setStatus('all')
    setFormat('all')
    setGenre('all')
    setMinRating(0)
    setYear(0)
  }

  return (
    <div className="pf">
      <aside className="pf__side">
        <div className="pf__search">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </g>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter"
            aria-label="Filter games"
          />
        </div>

        <div className="pf__group">
          <p className="pf__label">Lists</p>
          <div className="pf__lists">
            <button
              type="button"
              className="pf__list"
              aria-current={status === 'all'}
              onClick={() => setStatus('all')}
            >
              <span>All</span>
              <span className="pf__list-count">{items.length}</span>
            </button>
            {STATUS_GROUPS.map((s) => (
              <button
                key={s}
                type="button"
                className="pf__list"
                aria-current={status === s}
                onClick={() => setStatus(s)}
              >
                <span>{STATUS_LABEL[s]}</span>
                <span className="pf__list-count">{statusCounts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pf__group">
          <p className="pf__label">Filters</p>
          <div className="pf__selects">
            <select
              className="pf__select"
              value={format}
              onChange={(e) => setFormat(e.target.value === 'all' ? 'all' : (Number(e.target.value) as GameType))}
              aria-label="Format"
            >
              <option value="all">Format</option>
              {formats.map((f) => (
                <option key={f} value={f}>
                  {GAME_TYPE_LABEL[f]}
                </option>
              ))}
            </select>

            {genres.length > 0 && (
              <select
                className="pf__select"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                aria-label="Genre"
              >
                <option value="all">Genres</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            )}

            <select
              className="pf__select"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              aria-label="Minimum rating"
            >
              <option value={0}>Rating</option>
              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r}+
                </option>
              ))}
            </select>
          </div>
        </div>

        {maxYear > minYear && (
          <div className="pf__group">
            <p className="pf__label">
              <span>Year</span>
              <span className="pf__label-val">{year > 0 ? `${year}+` : 'Any'}</span>
            </p>
            <input
              type="range"
              className="pf__slider"
              min={minYear}
              max={maxYear}
              value={year > 0 ? year : minYear}
              onChange={(e) => {
                const v = Number(e.target.value)
                setYear(v === minYear ? 0 : v)
              }}
              aria-label="Released from year"
            />
          </div>
        )}

        <div className="pf__group">
          <p className="pf__label">Sort</p>
          <select
            className="pf__select"
            value={sort}
            onChange={(e) => setSort(e.target.value as ListSort)}
            aria-label="Sort by"
          >
            {LIST_SORTS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button type="button" className="pf__reset" onClick={reset}>
            Clear filters
          </button>
        )}
      </aside>

      <div className="pf__main">
        {sorted.length === 0 ? (
          <p className="chart-empty">No games match your filters.</p>
        ) : status === 'all' ? (
          <GroupedList items={sorted} favoriteIds={favoriteIds} />
        ) : (
          <EntryList items={sorted} favoriteIds={favoriteIds} />
        )}
      </div>
    </div>
  )
}

type PeopleState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; users: UserSummary[] }

function PeopleList({ state, emptyLabel }: { state: PeopleState; emptyLabel: string }) {
  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <div className="profile__people">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="skeleton skeleton--row" />
        ))}
      </div>
    )
  }
  if (state.status === 'error') {
    return (
      <div className="notice" role="alert">
        {state.message}
      </div>
    )
  }
  if (state.users.length === 0) {
    return <p className="chart-empty">{emptyLabel}</p>
  }
  return (
    <div className="profile__people">
      {state.users.map((user) => (
        <UserRow key={user.username} user={user} />
      ))}
    </div>
  )
}

export function ProfilePage() {
  const { signOut } = useSession()
  const { username } = useParams()
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [favorites, setFavorites] = useState<GameSummary[]>([])
  const [follow, setFollow] = useState<FollowState | null>(null)
  const [followPending, setFollowPending] = useState(false)
  const [followers, setFollowers] = useState<PeopleState>({ status: 'idle' })
  const [following, setFollowing] = useState<PeopleState>({ status: 'idle' })
  const [tab, setTab] = useState<ProfileTab>('overview')
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const xTab = searchParams.get('tab')
    if (xTab === 'overview' || xTab === 'list' || xTab === 'followers' || xTab === 'following') {
      setTab(xTab)
    }
  }, [searchParams])

  const followersRef = useRef(followers)
  followersRef.current = followers
  const followingRef = useRef(following)
  followingRef.current = following
  const activeNameRef = useRef<string | undefined>(undefined)
  activeNameRef.current = profileUser?.username

  const loadFollowers = useCallback((name: string) => {
    setFollowers({ status: 'loading' })
    api.follows
      .followers(name)
      .then((users) => {
        if (activeNameRef.current === name) setFollowers({ status: 'ready', users })
      })
      .catch((err) => {
        if (activeNameRef.current !== name) return
        setFollowers({
          status: 'error',
          message: err instanceof ApiError ? err.message : 'Could not load followers.',
        })
      })
  }, [])

  const loadFollowing = useCallback((name: string) => {
    setFollowing({ status: 'loading' })
    api.follows
      .following(name)
      .then((users) => {
        if (activeNameRef.current === name) setFollowing({ status: 'ready', users })
      })
      .catch((err) => {
        if (activeNameRef.current !== name) return
        setFollowing({
          status: 'error',
          message: err instanceof ApiError ? err.message : 'Could not load following.',
        })
      })
  }, [])

  useEffect(() => {
    const el = bannerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle('topbar-over-banner', entry.isIntersecting)
      },
      { rootMargin: '-70px 0px 0px 0px', threshold: 0 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      document.body.classList.remove('topbar-over-banner')
    }
  }, [profileUser?.bannerUrl, tab])

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })
    setProfileUser(null)
    setFavorites([])
    setFollow(null)
    setFollowers({ status: 'idle' })
    setFollowing({ status: 'idle' })
    setTab('overview')

    async function load() {
      try {
        const vm = username ? await api.profile.byUsername(username) : await api.profile.me()
        const items = vm.entries.map((entry) => ({ entry, game: entry.game }))
        if (active) {
          setProfileUser(vm.user)
          setFavorites(vm.favorites)
          setFollow({
            isSelf: vm.isSelf,
            isFollowing: vm.isFollowing,
            followers: vm.followerCount,
            following: vm.followingCount,
          })
          setState({ status: 'ready', items })
        }
      } catch (err) {
        if (!active) return
        if (err instanceof ApiError && err.status === 401) {
          signOut()
          return
        }
        const fallback = username ? 'Could not load this profile.' : 'Could not load your stats.'
        setState({
          status: 'error',
          message: err instanceof ApiError ? err.message : fallback,
        })
      }
    }

    load()
    return () => {
      active = false
    }
  }, [username, signOut])

  useEffect(() => {
    const name = profileUser?.username
    if (!name) return
    if (tab === 'followers' && followersRef.current.status === 'idle') loadFollowers(name)
    if (tab === 'following' && followingRef.current.status === 'idle') loadFollowing(name)
  }, [tab, profileUser, loadFollowers, loadFollowing])

  async function toggleFollow() {
    if (!profileUser || !follow || follow.isSelf || followPending) return
    const next = !follow.isFollowing
    setFollowPending(true)
    setFollow({
      ...follow,
      isFollowing: next,
      followers: follow.followers + (next ? 1 : -1),
    })
    try {
      if (next) await api.follows.follow(profileUser.username)
      else await api.follows.unfollow(profileUser.username)
      if (tab === 'followers') loadFollowers(profileUser.username)
      else setFollowers({ status: 'idle' })
    } catch {
      setFollow((prev) =>
        prev
          ? { ...prev, isFollowing: !next, followers: prev.followers + (next ? -1 : 1) }
          : prev,
      )
    } finally {
      setFollowPending(false)
    }
  }

  const items = state.status === 'ready' ? state.items : []
  const favoriteIds = useMemo(() => new Set(favorites.map((game) => game.id)), [favorites])

  const stats = useMemo(() => {
    const total = items.length
    const statusCounts = STATUS_OPTIONS.map((status) => ({
      status,
      count: items.filter((item) => item.entry.status === status).length,
    }))
    const completed = statusCounts.find((s) => STATUS_LABEL[s.status] === 'Completed')?.count ?? 0

    const ratings = items.map((item) => item.entry.rating).filter((r): r is number => r != null)
    const ratingHistogram = Array.from({ length: 10 }, (_, index) =>
      ratings.filter((rating) => rating === index + 1).length,
    )
    const avgRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null

    const genreCounts = new Map<string, number>()
    for (const item of items) {
      for (const genre of item.game?.genres ?? []) {
        genreCounts.set(genre.name, (genreCounts.get(genre.name) ?? 0) + 1)
      }
    }
    const topGenres = [...genreCounts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    const decadeCounts = new Map<number, number>()
    for (const item of items) {
      const date = item.game?.releaseDate
      if (!date) continue
      const decade = Math.floor(new Date(date).getFullYear() / 10) * 10
      decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + 1)
    }
    const decades = [...decadeCounts.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([decade, value]) => ({ label: `${decade}s`, value }))

    const recent = [...items]
      .sort(
        (a, b) =>
          new Date(b.entry.updatedAt).getTime() - new Date(a.entry.updatedAt).getTime(),
      )
      .slice(0, 12)

    return {
      total,
      completed,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      statusCounts,
      ratingHistogram,
      avgRating,
      ratedCount: ratings.length,
      topGenres,
      decades,
      recent,
    }
  }, [items])

  if (state.status === 'loading') {
    return (
      <section className="page profile" aria-busy="true">
        <div className="profile__head">
          <div className="sk sk--avatar" />
          <div className="profile__ident">
            <div className="sk sk--name" />
            <div className="sk sk--counts" />
          </div>
        </div>

        <div className="profile__tabs profile__tabs--sk">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="sk sk--tab" />
          ))}
        </div>

        <div className="stat-row">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="sk sk--stat" />
          ))}
        </div>

        <div className="profile__cols">
          <aside className="profile__charts">
            <div className="chart-card">
              <div className="sk sk--heading" />
              <div className="fav-grid">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="sk sk--fav" />
                ))}
              </div>
            </div>

            {Array.from({ length: 2 }, (_, index) => (
              <div className="chart-card" key={index}>
                <div className="sk sk--heading" />
                <div className="sk sk--chart" />
              </div>
            ))}
          </aside>

          <div className="profile__feed">
            <div className="sk sk--heading" />
            <div className="activity-list">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="sk sk--activity" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section className="page">
        <div className="notice" role="alert">
          {state.message}
        </div>
      </section>
    )
  }

  return (
    <section className={`page profile${profileUser?.bannerUrl ? ' profile--banner' : ''}`}>
      {profileUser?.bannerUrl && (
        <div className="profile__banner" ref={bannerRef}>
          <img src={profileUser.bannerUrl} alt="" />
        </div>
      )}

      <div className="profile__head">
        <Avatar name={profileUser?.username ?? ''} src={profileUser?.avatarUrl ?? null} size={64} />
        <div className="profile__ident">
          <h1 className="page__title">{profileUser?.username}</h1>
          {follow && (
            <div className="profile__counts">
              <button type="button" className="profile__count" onClick={() => setTab('followers')}>
                <strong>{follow.followers}</strong> {follow.followers === 1 ? 'follower' : 'followers'}
              </button>
              <button type="button" className="profile__count" onClick={() => setTab('following')}>
                <strong>{follow.following}</strong> following
              </button>
            </div>
          )}
        </div>
        {follow && !follow.isSelf && (
          <button
            type="button"
            className="follow-btn"
            data-following={follow.isFollowing || undefined}
            onClick={toggleFollow}
            disabled={followPending}
          >
            {follow.isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {profileUser?.bio && (
        <p className="profile__bio">{profileUser.bio}</p>
      )}

      <div className="profile__tabs" role="tablist" aria-label="Profile sections">
        <button
          type="button"
          role="tab"
          className="profile__tab"
          aria-selected={tab === 'overview'}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          className="profile__tab"
          aria-selected={tab === 'list'}
          onClick={() => setTab('list')}
        >
          List
          <span className="profile__tab-count">{stats.total}</span>
        </button>
        <button
          type="button"
          role="tab"
          className="profile__tab"
          aria-selected={tab === 'followers'}
          onClick={() => setTab('followers')}
        >
          Followers
          {follow && <span className="profile__tab-count">{follow.followers}</span>}
        </button>
        <button
          type="button"
          role="tab"
          className="profile__tab"
          aria-selected={tab === 'following'}
          onClick={() => setTab('following')}
        >
          Following
          {follow && <span className="profile__tab-count">{follow.following}</span>}
        </button>
      </div>

      {tab === 'overview' && (
        <>
          <div className="stat-row">
            <div className="stat">
              <span className="stat__value">{stats.total}</span>
              <span className="stat__label">Games tracked</span>
            </div>
            <div className="stat">
              <span className="stat__value">{stats.completed}</span>
              <span className="stat__label">Completed</span>
            </div>
            <div className="stat">
              <span className="stat__value">
                {stats.avgRating != null ? stats.avgRating.toFixed(1) : '—'}
              </span>
              <span className="stat__label">Avg rating</span>
            </div>
            <div className="stat">
              <span className="stat__value">{stats.completionRate}%</span>
              <span className="stat__label">Completion</span>
            </div>
          </div>

          <div className="profile__cols">
            <aside className="profile__charts">
              <Favorites games={favorites} />

              <div className="chart-card">
                <h2 className="chart-card__title">Status breakdown</h2>
                <Donut
                  segments={stats.statusCounts.map((s) => ({
                    value: s.count,
                    color: STATUS_COLOR[s.status],
                    label: STATUS_LABEL[s.status],
                  }))}
                />
              </div>

              <div className="chart-card">
                <h2 className="chart-card__title">Rating distribution</h2>
                <Histogram counts={stats.ratingHistogram} />
                <p className="chart-card__foot">
                  {stats.ratedCount > 0
                    ? `${stats.ratedCount} rated · avg ${stats.avgRating?.toFixed(1)}`
                    : 'Nothing rated yet'}
                </p>
              </div>

              <div className="chart-card">
                <h2 className="chart-card__title">Top genres</h2>
                <GenreTags rows={stats.topGenres} />
              </div>

              <div className="chart-card" style={{ '--status-color': 'var(--accent)' } as CSSProperties}>
                <h2 className="chart-card__title">By release decade</h2>
                <RankBars rows={stats.decades} />
              </div>
            </aside>

            <div className="profile__feed">
              <h2 className="chart-card__title">Recent activity</h2>
              <ActivityFeed items={stats.recent} />
            </div>
          </div>
        </>
      )}

      {tab === 'list' && <ProfileListView items={items} favoriteIds={favoriteIds} />}

      {tab === 'followers' && (
        <PeopleList state={followers} emptyLabel="No followers yet." />
      )}

      {tab === 'following' && (
        <PeopleList state={following} emptyLabel="Not following anyone yet." />
      )}
    </section>
  )
}
