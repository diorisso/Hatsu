import { useEffect, useState, type FormEvent } from 'react'
import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { ThemeToggle } from '../theme/ThemeToggle'
import { AccountMenu } from './AccountMenu'
import './layout.css'

function SearchBar() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const current = params.get('q') ?? ''
  const [query, setQuery] = useState(current)

  useEffect(() => {
    setQuery(current)
  }, [current])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const term = query.trim()
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <form className="searchbar" role="search" onSubmit={handleSubmit}>
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </g>
      </svg>
      <input
        className="searchbar__input"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search games…"
        aria-label="Search games"
      />
    </form>
  )
}

export function AppLayout() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="wordmark" aria-label="Hatsu home">
          Hatsu<i className="wordmark__dot" aria-hidden="true" />
        </Link>
        <SearchBar />
        <div className="topbar__actions">
          <ThemeToggle />
          <AccountMenu />
        </div>
      </header>
      <Outlet />
    </div>
  )
}
