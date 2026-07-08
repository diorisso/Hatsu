import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AuthPage } from './auth/AuthPage'
import { VerifyPage } from './auth/VerifyPage'
import { LibraryPage } from './library/LibraryPage'
import { GamePage } from './game/GamePage'
import { SettingsPage } from './settings/SettingsPage'
import { ProfilePage } from './profile/ProfilePage'
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
      <Route path="/verify" element={<VerifyPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<LibraryPage />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/u/:username" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
