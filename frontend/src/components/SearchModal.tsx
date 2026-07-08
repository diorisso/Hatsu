import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { api, ApiError } from '../api/client'
import type { GameResponse, SearchResult, UserSummary } from '../api/types'
import { GameRow } from './GameRow'
import { UserRow } from './UserRow'
import { QuickAddModal } from './QuickAddModal'
import './search-modal.css'

type SearchMode = 'games' | 'users'

type GameState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; results: SearchResult[] }

type UserState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; results: UserSummary[] }

interface SearchModalProps {
  onClose: () => void
}

export function SearchModal({ onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<SearchMode>('games')
  const [query, setQuery] = useState('')
  const [gameState, setGameState] = useState<GameState>({ status: 'idle' })
  const [userState, setUserState] = useState<UserState>({ status: 'idle' })
  const [addTarget, setAddTarget] = useState<GameResponse | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !addTarget) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [addTarget, onClose])

  useEffect(() => {
    const term = query.trim()
    if (!term) {
      setGameState({ status: 'idle' })
      setUserState({ status: 'idle' })
      return
    }

    let active = true
    const timer = setTimeout(() => {
      if (mode === 'games') {
        setGameState({ status: 'loading' })
        api.games
          .search(term, 24)
          .then((results) => {
            if (active) setGameState({ status: 'ready', results })
          })
          .catch((err) => {
            if (!active) return
            const message = err instanceof ApiError ? err.message : 'Search is unavailable right now.'
            setGameState({ status: 'error', message })
          })
      } else {
        setUserState({ status: 'loading' })
        api.users
          .search(term, 24)
          .then((results) => {
            if (active) setUserState({ status: 'ready', results })
          })
          .catch((err) => {
            if (!active) return
            const message = err instanceof ApiError ? err.message : 'Search is unavailable right now.'
            setUserState({ status: 'error', message })
          })
      }
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, mode])

  const term = query.trim()

  return createPortal(
    <div className="smodal" role="dialog" aria-modal="true" aria-label="Search">
      <div className="smodal__backdrop" onClick={onClose} />
      <div className="smodal__panel">
        <div className="smodal__search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </g>
          </svg>
          <input
            ref={inputRef}
            className="smodal__input"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={mode === 'games' ? 'Search games…' : 'Search users…'}
            aria-label={mode === 'games' ? 'Search games' : 'Search users'}
          />
          <kbd className="smodal__esc">Esc</kbd>
        </div>

        <div className="smodal__tabs" role="tablist" aria-label="Search type">
          <button
            type="button"
            role="tab"
            className="smodal__tab"
            aria-selected={mode === 'games'}
            onClick={() => setMode('games')}
          >
            Games
          </button>
          <button
            type="button"
            role="tab"
            className="smodal__tab"
            aria-selected={mode === 'users'}
            onClick={() => setMode('users')}
          >
            Users
          </button>
        </div>

        <div className="smodal__results">
          {mode === 'games' ? (
            <>
              {gameState.status === 'idle' && (
                <p className="smodal__hint">Start typing to find a game.</p>
              )}

              {gameState.status === 'loading' && (
                <div className="search-list">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index} className="skeleton skeleton--row" />
                  ))}
                </div>
              )}

              {gameState.status === 'error' && (
                <div className="notice" role="alert">
                  {gameState.message}
                </div>
              )}

              {gameState.status === 'ready' && gameState.results.length === 0 && (
                <p className="smodal__hint">No games matched &ldquo;{term}&rdquo;.</p>
              )}

              {gameState.status === 'ready' && gameState.results.length > 0 && (
                <div className="search-list">
                  {gameState.results.map((result) => (
                    <GameRow
                      key={result.game.id}
                      game={result.game}
                      status={result.status}
                      onAdd={setAddTarget}
                      onNavigate={onClose}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {userState.status === 'idle' && (
                <p className="smodal__hint">Start typing to find a user.</p>
              )}

              {userState.status === 'loading' && (
                <div className="search-list">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index} className="skeleton skeleton--row" />
                  ))}
                </div>
              )}

              {userState.status === 'error' && (
                <div className="notice" role="alert">
                  {userState.message}
                </div>
              )}

              {userState.status === 'ready' && userState.results.length === 0 && (
                <p className="smodal__hint">No users matched &ldquo;{term}&rdquo;.</p>
              )}

              {userState.status === 'ready' && userState.results.length > 0 && (
                <div className="search-list">
                  {userState.results.map((result) => (
                    <UserRow key={result.username} user={result} onNavigate={onClose} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {addTarget && (
        <QuickAddModal
          game={addTarget}
          onClose={() => setAddTarget(null)}
          onAdded={(entry) => {
            setGameState((prev) =>
              prev.status === 'ready'
                ? {
                    status: 'ready',
                    results: prev.results.map((result) =>
                      result.game.id === entry.gameId
                        ? { ...result, status: entry.status }
                        : result,
                    ),
                  }
                : prev,
            )
            setAddTarget(null)
          }}
        />
      )}
    </div>,
    document.body,
  )
}
