import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { EntryStatus, type EntryResponse, type GameResponse } from '../api/types'
import { GAME_TYPE_LABEL, STATUS_COLOR, coverUrl } from '../api/labels'
import { StatusSelect } from '../components/StatusSelect'
import { RatingSelect } from '../components/RatingSelect'
import './game.css'

export function GamePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const gameId = Number(id)

  const [game, setGame] = useState<GameResponse | null>(null)
  const [entry, setEntry] = useState<EntryResponse | null>(null)
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)

  const [status, setStatus] = useState<EntryStatus>(EntryStatus.Backlog)
  const [rating, setRating] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function run() {
      try {
        const [loadedGame, mine] = await Promise.all([
          api.games.getById(gameId),
          api.entries.mine(),
        ])
        if (!active) return
        setGame(loadedGame)
        const existing = mine.find((item) => item.gameId === gameId) ?? null
        setEntry(existing)
        if (existing) {
          setStatus(existing.status)
          setRating(existing.rating ?? null)
        }
        setPhase('ready')
      } catch (err) {
        if (!active) return
        setLoadError(err instanceof ApiError ? err.message : 'Could not load this game.')
        setPhase('error')
      }
    }

    run()
    return () => {
      active = false
    }
  }, [gameId])

  async function withBusy(action: () => Promise<void>) {
    setBusy(true)
    setNotice(null)
    try {
      await action()
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  function add() {
    return withBusy(async () => {
      const created = await api.entries.create({ gameId, status, rating })
      setEntry(created)
      setNotice('Added to your library.')
    })
  }

  function save() {
    if (!entry) return Promise.resolve()
    return withBusy(async () => {
      const updated = await api.entries.update(entry.id, { status, rating })
      setEntry(updated)
      setNotice('Changes saved.')
    })
  }

  function remove() {
    if (!entry) return Promise.resolve()
    return withBusy(async () => {
      await api.entries.remove(entry.id)
      setEntry(null)
      setRating(null)
      setStatus(EntryStatus.Backlog)
      setNotice('Removed from your library.')
    })
  }

  const backButton = (
    <button type="button" className="game__back-btn" onClick={() => navigate(-1)}>
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 5l-7 7 7 7" />
      </svg>
      Go back
    </button>
  )

  if (phase === 'loading') {
    return (
      <section className="page game">
        {backButton}
        <div className="game__hero">
          <div className="game__aside">
            <div className="game__cover game__cover--loading" />
          </div>
          <div className="game__intro">
            <div className="game__bar" style={{ width: '60%' }} />
            <div className="game__bar" style={{ width: '40%' }} />
            <div className="game__bar" style={{ width: '90%' }} />
          </div>
        </div>
      </section>
    )
  }

  if (phase === 'error' || !game) {
    return (
      <section className="page">
        <div className="notice" role="alert">
          {loadError ?? 'Game not found.'}
        </div>
        <p className="game__back">
          <Link to="/" className="link">
            Back to library
          </Link>
        </p>
      </section>
    )
  }

  const src = coverUrl(game.coverUrl)
  const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null

  return (
    <section className="page game">
      {backButton}
      <div className="game__hero">
        <div className="game__aside">
          <div
            className="game__cover"
            data-tracked={entry ? '' : undefined}
            style={
              entry
                ? ({ '--status-color': STATUS_COLOR[entry.status] } as CSSProperties)
                : undefined
            }
          >
            {src ? <img src={src} alt={game.name} /> : <span className="game__noart" />}
          </div>

          <div className="track">
            <div className="track__head">
              <span className="track__label">
                {entry ? 'In your library' : 'Track this game'}
              </span>
            </div>

            <div className="track__controls">
              <div className="track__field">
                <span>Status</span>
                <StatusSelect value={status} onChange={setStatus} disabled={busy} />
              </div>

              <div className="track__field">
                <span>Rating</span>
                <RatingSelect
                  value={rating}
                  onChange={setRating}
                  color={STATUS_COLOR[status]}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="track__actions">
              {entry ? (
                <>
                  <button className="btn" type="button" onClick={save} disabled={busy}>
                    {busy ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    className="ghost-btn"
                    type="button"
                    onClick={remove}
                    disabled={busy}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <button className="btn" type="button" onClick={add} disabled={busy}>
                  {busy ? 'Adding…' : 'Add to library'}
                </button>
              )}
            </div>

            {notice && <p className="track__notice">{notice}</p>}
          </div>
        </div>

        <div className="game__intro">
          <p className="eyebrow">{GAME_TYPE_LABEL[game.type]}</p>
          <h1 className="game__title">{game.name}</h1>

          <dl className="game__facts">
            {year && (
              <div className="game__fact">
                <dt>Released</dt>
                <dd>{year}</dd>
              </div>
            )}
            {game.developer && (
              <div className="game__fact">
                <dt>Developer</dt>
                <dd>{game.developer.name}</dd>
              </div>
            )}
            {game.publisher && (
              <div className="game__fact">
                <dt>Publisher</dt>
                <dd>{game.publisher.name}</dd>
              </div>
            )}
          </dl>

          {game.genres.length > 0 && (
            <ul className="game__platforms">
              {game.genres.map((genre) => (
                <li key={genre.id}>{genre.name}</li>
              ))}
            </ul>
          )}

          {game.platforms.length > 0 && (
            <ul className="game__platforms">
              {game.platforms.map((platform) => (
                <li key={platform.id}>{platform.name}</li>
              ))}
            </ul>
          )}

          {game.summary && <p className="game__summary">{game.summary}</p>}
        </div>
      </div>
    </section>
  )
}
