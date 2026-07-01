import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { ThemeProvider } from './theme/ThemeProvider'
import { AccentProvider } from './theme/AccentProvider'
import { SessionProvider } from './session/SessionProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AccentProvider>
        <SessionProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SessionProvider>
      </AccentProvider>
    </ThemeProvider>
  </StrictMode>,
)
