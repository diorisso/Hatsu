import './rating.css'

export function Rating({ rating }: { rating: number | null }) {
  if (rating === null) return null

  return (
    <span className="rating-mini">
      <svg className="rating-mini__star" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path d="M12 2.6l2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.93l-5.64 2.97 1.08-6.29-4.57-4.45 6.31-.92z" />
      </svg>
      <span className="rating-mini__value">{rating} / 10</span>
    </span>
  )
}
