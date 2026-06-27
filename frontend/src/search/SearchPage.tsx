import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { GameResponse } from '../api/types'
import { GameCard } from '../components/GameCard'

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; games: GameResponse[] }

export function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  const [state, setState] = useState<SearchState>({ status: 'idle' })

  useEffect(() => {
    if (!query) {
      setState({ status: 'idle' })
      return
    }

    let active = true
    setState({ status: 'loading' })

    api.games
      .search(query, 24)
      .then((games) => {
        if (active) setState({ status: 'ready', games })
      })
      .catch((err) => {
        if (!active) return
        const message =
          err instanceof ApiError ? err.message : 'Search is unavailable right now.'
        setState({ status: 'error', message })
      })

    return () => {
      active = false
    }
  }, [query])

  return (
    <section className="page">
      <div className="page__head">
        <p className="eyebrow">Search</p>
        <h1 className="page__title">
          {query ? <>Results for &ldquo;{query}&rdquo;</> : 'Find a game'}
        </h1>
      </div>

      {state.status === 'idle' && (
        <p className="notice">Type a title in the search bar to find games.</p>
      )}

      {state.status === 'loading' && (
        <div className="card-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="skeleton" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div className="notice" role="alert">
          {state.message}
        </div>
      )}

      {state.status === 'ready' && state.games.length === 0 && (
        <p className="notice">No games matched &ldquo;{query}&rdquo;.</p>
      )}

      {state.status === 'ready' && state.games.length > 0 && (
        <div className="card-grid">
          {state.games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </section>
  )
}
