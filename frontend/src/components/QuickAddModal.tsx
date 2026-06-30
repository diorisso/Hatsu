import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { api, ApiError } from '../api/client'
import { EntryStatus, type EntryResponse, type GameResponse } from '../api/types'
import { STATUS_COLOR, coverUrl } from '../api/labels'
import { StatusSelect } from './StatusSelect'
import { RatingSelect } from './RatingSelect'
import './quick-add.css'

interface QuickAddModalProps {
  game: GameResponse
  onClose: () => void
  onAdded: (entry: EntryResponse) => void
}

export function QuickAddModal({ game, onClose, onAdded }: QuickAddModalProps) {
  const [status, setStatus] = useState<EntryStatus>(EntryStatus.Backlog)
  const [rating, setRating] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [busy, onClose])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      const created = await api.entries.create({ gameId: game.id, status, rating })
      onAdded(created)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add this game.')
      setBusy(false)
    }
  }

  const src = coverUrl(game.coverUrl)
  const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null
  const meta = [year, game.developer?.name].filter(Boolean).join(' · ')

  return createPortal(
    <div className="qadd" role="dialog" aria-modal="true" aria-label={`Add ${game.name}`}>
      <div className="qadd__backdrop" onClick={() => !busy && onClose()} />
      <div className="qadd__panel">
        <div className="qadd__head">
          <div className="qadd__cover">
            {src ? <img src={src} alt="" /> : <span className="qadd__noart" />}
          </div>
          <div className="qadd__heading">
            <p className="eyebrow">Add to library</p>
            <h2 className="qadd__title">{game.name}</h2>
            {meta && <p className="qadd__meta">{meta}</p>}
          </div>
          <button type="button" className="qadd__close" aria-label="Close" onClick={onClose} disabled={busy}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="qadd__controls">
          <label className="qadd__field">
            <span>Status</span>
            <StatusSelect value={status} onChange={setStatus} disabled={busy} />
          </label>
          <label className="qadd__field">
            <span>Rating</span>
            <RatingSelect value={rating} onChange={setRating} color={STATUS_COLOR[status]} disabled={busy} />
          </label>
        </div>

        {error && <p className="qadd__error" role="alert">{error}</p>}

        <div className="qadd__actions" style={{ '--status-color': STATUS_COLOR[status] } as CSSProperties}>
          <button type="button" className="ghost-btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={submit} disabled={busy}>
            {busy ? 'Adding…' : 'Add to library'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
