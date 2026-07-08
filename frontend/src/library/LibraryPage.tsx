import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { EntryStatus, EntryViewModel, GameSummary } from '../api/types'
import { STATUS_COLOR, STATUS_LABEL, STATUS_OPTIONS, STATUS_SORT_ORDER } from '../api/labels'
import { EntryCard } from '../components/EntryCard'
import { CompactCard } from '../components/CompactCard'
import { EntryRow } from '../components/EntryRow'
import { EditEntryModal } from '../components/EditEntryModal'
import { StatusIcon } from '../components/StatusIcon'
import { SortMenu } from './SortMenu'
import { useSession } from '../session/SessionProvider'
import './library.css'

interface LibraryItem {
  entry: EntryViewModel
  game: GameSummary | null
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: LibraryItem[] }

type SortKey = 'added' | 'title' | 'rating'
type ViewMode = 'list' | 'cards' | 'compact'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'added', label: 'Recently added' },
  { key: 'title', label: 'Title (A–Z)' },
  { key: 'rating', label: 'Highest rated' },
]

const STATUS_GROUPS = [...STATUS_OPTIONS].sort(
  (a, b) => STATUS_SORT_ORDER[a] - STATUS_SORT_ORDER[b],
)

const SORT_KEY = 'hatsu.library.sort'
const VIEW_KEY = 'hatsu.library.view'
const SORT_KEYS = SORT_OPTIONS.map((option) => option.key)
const VIEW_MODES: ViewMode[] = ['list', 'cards', 'compact']

function readStored<T extends string>(key: string, allowed: T[], fallback: T): T {
  const stored = localStorage.getItem(key)
  return stored && (allowed as string[]).includes(stored) ? (stored as T) : fallback
}

function titleOf(item: LibraryItem): string {
  return item.game?.name ?? `Game #${item.game?.id ?? item.entry.id}`
}

function renderItems(
  items: LibraryItem[],
  view: ViewMode,
  favoriteIds: Set<number>,
  onEdit: (item: LibraryItem) => void,
) {
  if (view === 'list') {
    return (
      <div className="lib-list">
        {items.map((item) => {
          const { entry, game } = item
          return (
            <EntryRow
              key={entry.id}
              to={`/game/${game?.id ?? ''}`}
              title={game?.name ?? `Game #${entry.id}`}
              status={entry.status}
              rating={entry.rating}
              cover={game?.coverUrl ?? null}
              favorite={game != null && favoriteIds.has(game.id)}
              onEdit={() => onEdit(item)}
            />
          )
        })}
      </div>
    )
  }

  const gridClass = view === 'compact' ? 'card-grid card-grid--compact' : 'card-grid'
  return (
    <div className={gridClass}>
      {items.map((item) => {
        const { entry, game } = item
        const title = game?.name ?? `Game #${entry.id}`
        const cover = game?.coverUrl ?? null
        const favorite = game != null && favoriteIds.has(game.id)
        return (
          <Link key={entry.id} to={`/game/${game?.id ?? ''}`} className="card-link">
            {view === 'compact' ? (
              <CompactCard title={title} status={entry.status} rating={entry.rating} cover={cover} favorite={favorite} onEdit={() => onEdit(item)} />
            ) : (
              <EntryCard title={title} status={entry.status} rating={entry.rating} cover={cover} favorite={favorite} onEdit={() => onEdit(item)} />
            )}
          </Link>
        )
      })}
    </div>
  )
}

function sortItems(items: LibraryItem[], sort: SortKey): LibraryItem[] {
  const sorted = [...items]
  switch (sort) {
    case 'title':
      sorted.sort((a, b) => titleOf(a).localeCompare(titleOf(b), undefined, { sensitivity: 'base' }))
      break
    case 'rating':
      sorted.sort(
        (a, b) =>
          (b.entry.rating ?? -1) - (a.entry.rating ?? -1) || titleOf(a).localeCompare(titleOf(b)),
      )
      break
    case 'added':
    default:
      sorted.sort((a, b) => b.entry.createdAt.localeCompare(a.entry.createdAt))
      break
  }
  return sorted
}

export function LibraryPage() {
  const { signOut } = useSession()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [sort, setSort] = useState<SortKey>(() => readStored(SORT_KEY, SORT_KEYS, 'added'))
  const [view, setView] = useState<ViewMode>(() => readStored(VIEW_KEY, VIEW_MODES, 'cards'))
  const [collapsed, setCollapsed] = useState<Set<EntryStatus>>(() => new Set())
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set())
  const [editing, setEditing] = useState<LibraryItem | null>(null)

  useEffect(() => {
    localStorage.setItem(SORT_KEY, sort)
  }, [sort])

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view)
  }, [view])

  function toggleCollapse(status: EntryStatus) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const vm = await api.library.me()
        const items = vm.entries.map((entry) => ({ entry, game: entry.game }))
        if (active) {
          setFavoriteIds(new Set(vm.favoriteGameIds))
          setState({ status: 'ready', items })
        }
      } catch (err) {
        if (!active) return
        if (err instanceof ApiError && err.status === 401) {
          signOut()
          return
        }
        const message =
          err instanceof ApiError ? err.message : 'Could not load your library.'
        setState({ status: 'error', message })
      }
    }

    load()
    return () => {
      active = false
    }
  }, [signOut])

  const items = state.status === 'ready' ? state.items : []
  const sortedItems = useMemo(() => sortItems(items, sort), [items, sort])
  const hasItems = state.status === 'ready' && items.length > 0

  return (
    <section className="page">
      <div className="library__head">
        <div>
          <p className="eyebrow">Your collection</p>
          <h1 className="page__title">Library</h1>
        </div>

        {hasItems && (
          <div className="library__tools">
            <div className="viewseg" role="group" aria-label="Library view">
              <button
                type="button"
                className="viewseg__btn"
                aria-pressed={view === 'list'}
                aria-label="List view"
                onClick={() => setView('list')}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                type="button"
                className="viewseg__btn"
                aria-pressed={view === 'cards'}
                aria-label="Large cards"
                onClick={() => setView('cards')}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <rect x="4" y="4" width="7" height="7" rx="1.4" />
                  <rect x="13" y="4" width="7" height="7" rx="1.4" />
                  <rect x="4" y="13" width="7" height="7" rx="1.4" />
                  <rect x="13" y="13" width="7" height="7" rx="1.4" />
                </svg>
              </button>
              <button
                type="button"
                className="viewseg__btn"
                aria-pressed={view === 'compact'}
                aria-label="Small cards"
                onClick={() => setView('compact')}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <rect x="4" y="4" width="4" height="4" rx="1" />
                  <rect x="10" y="4" width="4" height="4" rx="1" />
                  <rect x="16" y="4" width="4" height="4" rx="1" />
                  <rect x="4" y="10" width="4" height="4" rx="1" />
                  <rect x="10" y="10" width="4" height="4" rx="1" />
                  <rect x="16" y="10" width="4" height="4" rx="1" />
                  <rect x="4" y="16" width="4" height="4" rx="1" />
                  <rect x="10" y="16" width="4" height="4" rx="1" />
                  <rect x="16" y="16" width="4" height="4" rx="1" />
                </svg>
              </button>
            </div>
            <SortMenu value={sort} options={SORT_OPTIONS} onChange={setSort} />
          </div>
        )}
      </div>

      {state.status === 'loading' && (
        <div className="card-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="skeleton" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div className="notice" role="alert">
          {state.message}
        </div>
      )}

      {state.status === 'ready' && items.length === 0 && (
        <div className="empty">
          <div className="empty__mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h2 className="empty__title">No games yet</h2>
          <p className="empty__sub">
            Search for a game above to add your first entry and start tracking.
          </p>
        </div>
      )}

      {hasItems && (
        <div className="groups">
          {STATUS_GROUPS.map((status) => {
              const groupItems = sortedItems.filter((item) => item.entry.status === status)
              if (groupItems.length === 0) return null
              const open = !collapsed.has(status)
              return (
                <section
                  className="group"
                  key={status}
                  style={{ '--status-color': STATUS_COLOR[status] } as CSSProperties}
                >
                  <button
                    type="button"
                    className="group__head"
                    aria-expanded={open}
                    onClick={() => toggleCollapse(status)}
                  >
                    <StatusIcon status={status} className="group__icon" />
                    <span className="group__name">{STATUS_LABEL[status]}</span>
                    <span className="group__count">{groupItems.length}</span>
                    <svg
                      className="group__chev"
                      data-open={open}
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div className="group__body" data-open={open}>
                    <div className="group__inner">{renderItems(groupItems, view, favoriteIds, setEditing)}</div>
                  </div>
                </section>
              )
          })}
        </div>
      )}

      {editing && (
        <EditEntryModal
          entryId={editing.entry.id}
          title={editing.game?.name ?? `Game #${editing.entry.id}`}
          cover={editing.game?.coverUrl ?? null}
          initialStatus={editing.entry.status}
          initialRating={editing.entry.rating}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setState((prev) =>
              prev.status === 'ready'
                ? {
                    status: 'ready',
                    items: prev.items.map((it) =>
                      it.entry.id === updated.id
                        ? {
                            ...it,
                            entry: {
                              ...it.entry,
                              status: updated.status,
                              rating: updated.rating,
                              notes: updated.notes,
                              updatedAt: updated.updatedAt,
                            },
                          }
                        : it,
                    ),
                  }
                : prev,
            )
            setEditing(null)
          }}
          onRemoved={(entryId) => {
            setState((prev) =>
              prev.status === 'ready'
                ? { status: 'ready', items: prev.items.filter((it) => it.entry.id !== entryId) }
                : prev,
            )
            setEditing(null)
          }}
        />
      )}
    </section>
  )
}
