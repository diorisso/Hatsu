import { type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { EntryStatus, GameResponse } from '../api/types'
import { STATUS_COLOR, STATUS_LABEL, coverUrl } from '../api/labels'
import { StatusIcon } from './StatusIcon'
import './game-row.css'

interface GameRowProps {
  game: GameResponse
  status: EntryStatus | null
  onAdd: (game: GameResponse) => void
}

export function GameRow({ game, status, onAdd }: GameRowProps) {
  const src = coverUrl(game.coverUrl)
  const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null
  const meta = [year, game.developer?.name].filter(Boolean).join(' · ')
  const inLibrary = status !== null

  return (
    <div className="game-row">
      <Link to={`/game/${game.id}`} className="game-row__main">
        <div className="game-row__cover">
          {src ? <img src={src} alt="" loading="lazy" /> : <span className="game-row__noart" />}
        </div>
        <div className="game-row__body">
          <span className="game-row__title">{game.name}</span>
          {meta && <span className="game-row__meta">{meta}</span>}
        </div>
      </Link>

      <button
        type="button"
        className="game-row__add"
        data-in-library={inLibrary || undefined}
        aria-label={
          inLibrary
            ? `${game.name} is in your library (${STATUS_LABEL[status]})`
            : `Add ${game.name} to your library`
        }
        disabled={inLibrary}
        onClick={() => onAdd(game)}
        style={inLibrary ? ({ '--status-color': STATUS_COLOR[status] } as CSSProperties) : undefined}
      >
        {inLibrary ? (
          <StatusIcon status={status} className="game-row__status-icon" />
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>
    </div>
  )
}
