import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getToken, setToken } from '../api/client'

interface SessionContextValue {
  token: string | null
  isAuthenticated: boolean
  signIn: (token: string) => void
  signOut: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())

  const signIn = useCallback((next: string) => {
    setToken(next)
    setTokenState(next)
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    setTokenState(null)
  }, [])

  const value = useMemo(
    () => ({ token, isAuthenticated: token !== null, signIn, signOut }),
    [token, signIn, signOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used within a SessionProvider')
  return context
}
