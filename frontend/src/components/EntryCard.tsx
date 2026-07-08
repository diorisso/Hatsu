import type { CSSProperties } from 'react'
import type { EntryStatus } from '../api/types'
import { STATUS_COLOR, coverUrl } from '../api/labels'
import { Rating } from './Rating'
import { HeartIcon } from './HeartIcon'
import { MoreButton } from './MoreButton'
import './entry-card.css'

interface EntryCardProps {
  title: string
  status: EntryStatus
  rating: number | null
  cover: string | null
  favorite?: boolean
  onEdit?: () => void
}

export function EntryCard({ title, status, rating, cover, favorite, onEdit }: EntryCardProps) {
  const src = coverUrl(cover)

  return (
    <article
      className="entry-card"
      style={{ '--status-color': STATUS_COLOR[status] } as CSSProperties}
    >
      <div className="entry-card__cover">
        {src ? <img src={src} alt="" loading="lazy" /> : <span className="entry-card__noart" />}
        {onEdit && <MoreButton onClick={onEdit} />}
        {favorite && (
          <span className="fav-badge" aria-label="Favorite">
            <HeartIcon filled size={15} />
          </span>
        )}
      </div>
      <div className="entry-card__body">
        <h3 className="entry-card__title" title={title}>
          {title}
        </h3>
        <div className="entry-card__rating">
          <Rating rating={rating} />
        </div>
      </div>
    </article>
  )
}
