import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_ACCENT } from './accents'

const STORAGE_KEY = 'hatsu.accent'

interface AccentContextValue {
  accent: string
  setAccent: (value: string) => void
}

const AccentContext = createContext<AccentContextValue | null>(null)

function readInitial(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_ACCENT
}

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<string>(readInitial)

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent)
    localStorage.setItem(STORAGE_KEY, accent)
  }, [accent])

  const setAccent = useCallback((value: string) => setAccentState(value), [])

  const value = useMemo(() => ({ accent, setAccent }), [accent, setAccent])

  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>
}

export function useAccent(): AccentContextValue {
  const context = useContext(AccentContext)
  if (!context) throw new Error('useAccent must be used within an AccentProvider')
  return context
}
