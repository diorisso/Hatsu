import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { EntryStatus } from '../api/types'
import { STATUS_COLOR, coverUrl } from '../api/labels'
import { Rating } from './Rating'
import './entry-row.css'

interface EntryRowProps {
  to: string
  title: string
  status: EntryStatus
  rating: number | null
  cover: string | null
}

export function EntryRow({ to, title, status, rating, cover }: EntryRowProps) {
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
      <Rating rating={rating} />
    </Link>
  )
}
