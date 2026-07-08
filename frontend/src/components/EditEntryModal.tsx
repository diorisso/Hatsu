import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { api, ApiError } from '../api/client'
import { type EntryResponse, type EntryStatus } from '../api/types'
import { STATUS_COLOR, coverUrl } from '../api/labels'
import { StatusSelect } from './StatusSelect'
import { RatingSelect } from './RatingSelect'
import './quick-add.css'

interface EditEntryModalProps {
  entryId: number
  title: string
  cover: string | null
  initialStatus: EntryStatus
  initialRating: number | null
  onClose: () => void
  onSaved: (entry: EntryResponse) => void
  onRemoved: (entryId: number) => void
}

export function EditEntryModal({
  entryId,
  title,
  cover,
  initialStatus,
  initialRating,
  onClose,
  onSaved,
  onRemoved,
}: EditEntryModalProps) {
  const [status, setStatus] = useState<EntryStatus>(initialStatus)
  const [rating, setRating] = useState<number | null>(initialRating)
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

  async function save() {
    setBusy(true)
    setError(null)
    try {
      const updated = await api.entries.update(entryId, { status, rating })
      onSaved(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save changes.')
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    setError(null)
    try {
      await api.entries.remove(entryId)
      onRemoved(entryId)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove this game.')
      setBusy(false)
    }
  }

  const src = coverUrl(cover)

  return createPortal(
    <div className="qadd" role="dialog" aria-modal="true" aria-label={`Edit ${title}`}>
      <div className="qadd__backdrop" onClick={() => !busy && onClose()} />
      <div className="qadd__panel">
        <div className="qadd__head">
          <div className="qadd__cover">
            {src ? <img src={src} alt="" /> : <span className="qadd__noart" />}
          </div>
          <div className="qadd__heading">
            <p className="eyebrow">Edit entry</p>
            <h2 className="qadd__title">{title}</h2>
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
          <button type="button" className="ghost-btn" onClick={remove} disabled={busy}>
            Remove
          </button>
          <button type="button" className="btn" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
