import type { CSSProperties } from 'react'
import type { EntryStatus } from '../api/types'
import { STATUS_COLOR, coverUrl } from '../api/labels'
import { Rating } from './Rating'
import { HeartIcon } from './HeartIcon'
import { MoreButton } from './MoreButton'
import './compact-card.css'

interface CompactCardProps {
  title: string
  status: EntryStatus
  rating: number | null
  cover: string | null
  favorite?: boolean
  onEdit?: () => void
}

export function CompactCard({ title, status, rating, cover, favorite, onEdit }: CompactCardProps) {
  const src = coverUrl(cover)

  return (
    <div
      className="compact-card"
      style={{ '--status-color': STATUS_COLOR[status] } as CSSProperties}
    >
      <div className="compact-card__cover">
        {src ? (
          <img src={src} alt="" loading="lazy" />
        ) : (
          <span className="compact-card__noart" />
        )}
        {onEdit && <MoreButton onClick={onEdit} />}
        {favorite && (
          <span className="fav-badge" aria-label="Favorite">
            <HeartIcon filled size={14} />
          </span>
        )}
      </div>
      <div className="compact-card__overlay">
        <h3 className="compact-card__title" title={title}>
          {title}
        </h3>
        <Rating rating={rating} />
      </div>
    </div>
  )
}
