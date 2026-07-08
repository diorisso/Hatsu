import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { AccountMenu } from './AccountMenu'
import { SearchModal } from './SearchModal'
import './layout.css'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iP(hone|ad|od)/.test(navigator.platform)

function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  const hint = `Search (${IS_MAC ? '⌘K' : 'Ctrl K'})`
  return (
    <button type="button" className="icon-btn" onClick={onOpen} aria-label={hint} title={hint}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </g>
      </svg>
    </button>
  )
}

export function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const isShortcut =
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey &&
        event.key.toLowerCase() === 'k'
      if (!isShortcut) return
      event.preventDefault()
      setSearchOpen(true)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="wordmark" aria-label="Hatsu home">
          Hatsu<i className="wordmark__dot" aria-hidden="true" />
        </Link>
        <div className="topbar__actions">
          <SearchTrigger onOpen={() => setSearchOpen(true)} />
          <AccountMenu />
        </div>
      </header>
      <Outlet />
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
