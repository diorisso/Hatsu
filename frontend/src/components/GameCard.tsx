import { Link } from 'react-router-dom'
import type { GameResponse } from '../api/types'
import { coverUrl } from '../api/labels'
import './game-card.css'

export function GameCard({ game }: { game: GameResponse }) {
  const src = coverUrl(game.coverUrl)
  const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null
  const meta = [year, game.developer?.name].filter(Boolean).join(' · ')

  return (
    <Link to={`/game/${game.id}`} className="game-card">
      <div className="game-card__cover">
        {src ? (
          <img src={src} alt="" loading="lazy" />
        ) : (
          <span className="game-card__noart" />
        )}
      </div>
      <div className="game-card__body">
        <h3 className="game-card__title" title={game.name}>
          {game.name}
        </h3>
        {meta && <p className="game-card__meta">{meta}</p>}
      </div>
    </Link>
  )
}
