import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { EntryStatus } from '../api/types'
import { STATUS_COLOR, coverUrl } from '../api/labels'
import { Rating } from './Rating'
import { HeartIcon } from './HeartIcon'
import { MoreButton } from './MoreButton'
import './entry-row.css'

interface EntryRowProps {
  to: string
  title: string
  status: EntryStatus
  rating: number | null
  cover: string | null
  favorite?: boolean
  onEdit?: () => void
}

export function EntryRow({ to, title, status, rating, cover, favorite, onEdit }: EntryRowProps) {
  const src = coverUrl(cover)

  return (
    <Link
      to={to}
      className="lib-row"
      style={{ '--status-color': STATUS_COLOR[status] } as CSSProperties}
    >
      <div className="lib-row__cover">
        {src ? <img src={src} alt="" loading="lazy" /> : <span className="lib-row__noart" />}
      </div>
      <span className="lib-row__title">{title}</span>
      {favorite && <HeartIcon filled size={15} className="lib-row__fav" />}
      <Rating rating={rating} />
      {onEdit && <MoreButton onClick={onEdit} className="more-btn--inline" />}
    </Link>
  )
}
