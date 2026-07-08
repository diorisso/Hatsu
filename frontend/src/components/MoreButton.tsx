import type { MouseEvent } from 'react'
import './more-btn.css'

interface MoreButtonProps {
  onClick: () => void
  className?: string
  label?: string
}

export function MoreButton({ onClick, className, label = 'Edit entry' }: MoreButtonProps) {
  function handleClick(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    onClick()
  }

  return (
    <button
      type="button"
      className={className ? `more-btn ${className}` : 'more-btn'}
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="12" r="1.9" />
        <circle cx="12" cy="12" r="1.9" />
        <circle cx="19" cy="12" r="1.9" />
      </svg>
    </button>
  )
}
