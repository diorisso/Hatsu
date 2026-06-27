import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { EntryStatus } from '../api/types'
import { STATUS_COLOR, STATUS_LABEL, STATUS_OPTIONS } from '../api/labels'
import { StatusIcon } from './StatusIcon'
import './select-menu.css'

interface StatusSelectProps {
  value: EntryStatus
  onChange: (status: EntryStatus) => void
  disabled?: boolean
}

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
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
    <div className="menusel" ref={ref}>
      <button
        type="button"
        className="menusel__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        style={{ '--status-color': STATUS_COLOR[value] } as CSSProperties}
      >
        <StatusIcon status={value} className="menusel__icon" />
        <span>{STATUS_LABEL[value]}</span>
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
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              role="option"
              aria-selected={status === value}
              className="menusel__item"
              data-active={status === value}
              style={{ '--status-color': STATUS_COLOR[status] } as CSSProperties}
              onClick={() => {
                onChange(status)
                setOpen(false)
              }}
            >
              <StatusIcon status={status} className="menusel__icon" />
              <span>{STATUS_LABEL[status]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
