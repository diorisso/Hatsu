import type { CSSProperties } from 'react'
import type { EntryStatus } from '../api/types'
import { STATUS_COLOR, coverUrl } from '../api/labels'
import { Rating } from './Rating'
import './entry-card.css'

interface EntryCardProps {
  title: string
  status: EntryStatus
  rating: number | null
  cover: string | null
}

export function EntryCard({ title, status, rating, cover }: EntryCardProps) {
  const src = coverUrl(cover)

  return (
    <article
      className="entry-card"
      style={{ '--status-color': STATUS_COLOR[status] } as CSSProperties}
    >
      <div className="entry-card__cover">
        {src ? <img src={src} alt="" loading="lazy" /> : <span className="entry-card__noart" />}
      </div>
      <div className="entry-card__body">
        <h3 className="entry-card__title" title={title}>
          {title}
        </h3>
        <Rating rating={rating} />
      </div>
    </article>
  )
}
