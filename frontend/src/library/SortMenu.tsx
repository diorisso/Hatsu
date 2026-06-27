import { useEffect, useRef, useState } from 'react'

interface SortMenuProps<T extends string> {
  value: T
  options: { key: T; label: string }[]
  onChange: (key: T) => void
}

export function SortMenu<T extends string>({ value, options, onChange }: SortMenuProps<T>) {
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
    <div className="sort" ref={ref}>
      <button
        type="button"
        className="sort__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Sort library"
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          viewBox="0 0 24 24"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h13M4 12h9M4 17h5" />
        </svg>
      </button>

      {open && (
        <div className="sort__menu" role="menu">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              role="menuitemradio"
              aria-checked={option.key === value}
              className="sort__item"
              data-active={option.key === value}
              onClick={() => {
                onChange(option.key)
                setOpen(false)
              }}
            >
              <span>{option.label}</span>
              {option.key === value && (
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4 4 10-10" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
