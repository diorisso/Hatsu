import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, ApiError, getToken, setToken } from '../api/client'
import type { UserResponse } from '../api/types'

interface SessionContextValue {
  token: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  signIn: (token: string) => void
  signOut: () => void
  updateUser: (user: UserResponse) => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<UserResponse | null>(null)

  const signIn = useCallback((next: string) => {
    setToken(next)
    setTokenState(next)
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    setTokenState(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((next: UserResponse) => {
    setUser(next)
  }, [])

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    let active = true
    api.users
      .me()
      .then((next) => {
        if (active) setUser(next)
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) signOut()
      })

    return () => {
      active = false
    }
  }, [token, signOut])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: token !== null, signIn, signOut, updateUser }),
    [token, user, signIn, signOut, updateUser],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used within a SessionProvider')
  return context
}
