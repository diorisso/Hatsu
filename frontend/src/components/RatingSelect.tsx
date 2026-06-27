import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './select-menu.css'

interface RatingSelectProps {
  value: number | null
  onChange: (rating: number | null) => void
  color: string
  disabled?: boolean
}

const RATING_VALUES: (number | null)[] = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function ratingLabel(value: number | null): string {
  return value === null ? 'Unrated' : `${value} / 10`
}

function Star({ muted }: { muted: boolean }) {
  return (
    <svg
      className={muted ? 'menusel__icon menusel__icon--muted' : 'menusel__icon'}
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.6l2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.93l-5.64 2.97 1.08-6.29-4.57-4.45 6.31-.92z" />
    </svg>
  )
}

export function RatingSelect({ value, onChange, color, disabled }: RatingSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointer(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="menusel" ref={ref} style={{ '--status-color': color } as CSSProperties}>
      <button
        type="button"
        className="menusel__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <Star muted={value === null} />
        <span>{ratingLabel(value)}</span>
        <svg
          className="menusel__chev"
          data-open={open}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="menusel__menu" role="listbox">
          {RATING_VALUES.map((option) => (
            <button
              key={String(option)}
              type="button"
              role="option"
              aria-selected={option === value}
              className="menusel__item"
              data-active={option === value}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
            >
              <Star muted={option === null} />
              <span>{ratingLabel(option)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
