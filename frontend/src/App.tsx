import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AuthPage } from './auth/AuthPage'
import { LibraryPage } from './library/LibraryPage'
import { SearchPage } from './search/SearchPage'
import { GamePage } from './game/GamePage'
import { useSession } from './session/SessionProvider'

function RequireAuth({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useSession()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { isAuthenticated } = useSession()

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<LibraryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/game/:id" element={<GamePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
