import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { api, ApiError } from '../api/client'
import type { EntryResponse, GameResponse } from '../api/types'
import { STATUS_COLOR, STATUS_LABEL, STATUS_OPTIONS } from '../api/labels'
import { useSession } from '../session/SessionProvider'
import { Avatar } from '../components/Avatar'
import './profile.css'

interface Item {
  entry: EntryResponse
  game: GameResponse | null
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: Item[] }

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

export function ProfilePage() {
  const { user, signOut } = useSession()
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const entries = await api.entries.mine()
        const ids = [...new Set(entries.map((entry) => entry.gameId))]
        const games = await Promise.all(ids.map((id) => api.games.getById(id).catch(() => null)))
        const gameById = new Map<number, GameResponse>()
        for (const game of games) {
          if (game) gameById.set(game.id, game)
        }
        const items = entries.map((entry) => ({ entry, game: gameById.get(entry.gameId) ?? null }))
        if (active) setState({ status: 'ready', items })
      } catch (err) {
        if (!active) return
        if (err instanceof ApiError && err.status === 401) {
          signOut()
          return
        }
        setState({
          status: 'error',
          message: err instanceof ApiError ? err.message : 'Could not load your stats.',
        })
      }
    }

    load()
    return () => {
      active = false
    }
  }, [signOut])

  const items = state.status === 'ready' ? state.items : []

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
    }
  }, [items])

  if (state.status === 'loading') {
    return (
      <section className="page">
        <div className="card-grid">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="skeleton skeleton--row" />
          ))}
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

  if (stats.total === 0) {
    return (
      <section className="page">
        <div className="page__head">
          <p className="eyebrow">Profile</p>
          <h1 className="page__title">{user?.username}</h1>
        </div>
        <p className="notice">Add games to your library to see your stats come to life.</p>
      </section>
    )
  }

  return (
    <section className="page profile">
      <div className="profile__head">
        <Avatar name={user?.username ?? ''} src={user?.avatarUrl ?? null} size={64} />
        <div>
          <p className="eyebrow">Profile</p>
          <h1 className="page__title">{user?.username}</h1>
        </div>
      </div>

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

      <div className="chart-grid">
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
          <RankBars rows={stats.topGenres} />
        </div>

        <div className="chart-card" style={{ '--status-color': 'var(--accent)' } as CSSProperties}>
          <h2 className="chart-card__title">By release decade</h2>
          <RankBars rows={stats.decades} />
        </div>
      </div>
    </section>
  )
}
