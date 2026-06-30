import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { ThemeToggle } from '../theme/ThemeToggle'
import { useSession } from '../session/SessionProvider'
import './auth.css'

type Mode = 'login' | 'register'
type ResendState = 'idle' | 'sending' | 'sent'

export function AuthPage() {
  const { signIn } = useSession()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unverified, setUnverified] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [resend, setResend] = useState<ResendState>('idle')

  const isRegister = mode === 'register'

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    setError(null)
    setUnverified(false)
    setResend('idle')
  }

  async function handleResend() {
    if (!email || resend === 'sending') return
    setResend('sending')
    await api.auth.resend(email).catch(() => null)
    setResend('sent')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setUnverified(false)
    try {
      if (isRegister) {
        await api.auth.register({ username, email, password })
        setRegisteredEmail(email)
        setResend('idle')
        setLoading(false)
        return
      }
      const result = await api.auth.login({ email, password })
      signIn(result.token)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setUnverified(true)
        setError(err.message)
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
      }
      setLoading(false)
    }
  }

  function backToSignIn() {
    setRegisteredEmail(null)
    setMode('login')
    setError(null)
    setUnverified(false)
    setResend('idle')
    setPassword('')
  }

  return (
    <div className="auth">
      <aside className="brand">
        <span className="brand__glow" aria-hidden="true" />

        <span className="wordmark">
          Hatsu<i className="wordmark__dot" aria-hidden="true" />
        </span>
        <p className="brand__mobile-tag">Track every game you play.</p>

        <div className="brand__stage" aria-hidden="true">
          <div className="card card--ghost" />
          <article className="card card--hero">
            <div className="card__cover" />
            <div className="card__body">
              <span className="chip">Now Playing</span>
              <h2 className="card__title">Elden Ring</h2>
              <div className="rating">
                <svg
                  className="rating__star"
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  aria-hidden="true"
                >
                  <path d="M12 2.6l2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.93l-5.64 2.97 1.08-6.29-4.57-4.45 6.31-.92z" />
                </svg>
                <span className="rating__value">9 / 10</span>
              </div>
            </div>
          </article>
        </div>

        <div className="brand__foot">
          <p className="brand__tag">Keep tabs on every game you play.</p>
          <p className="brand__statuses">
            Now Playing · Completed · Backlog · Dropped
          </p>
        </div>
      </aside>

      <main className="panel">
        <header className="panel__head">
          <ThemeToggle />
        </header>

        <div className="panel__body">
          {registeredEmail ? (
            <div className="form">
              <p className="eyebrow">Almost there</p>
              <h1 className="form__title">Check your inbox</h1>
              <p className="form__sub">
                We sent a verification link to <strong>{registeredEmail}</strong>. Click it to
                activate your account, then sign in.
              </p>

              <button className="btn" type="button" onClick={backToSignIn}>
                Back to sign in
              </button>

              <p className="form__switch">
                Didn&rsquo;t get it?{' '}
                <button
                  type="button"
                  className="link"
                  onClick={handleResend}
                  disabled={resend === 'sending'}
                >
                  {resend === 'sent'
                    ? 'Sent — check again'
                    : resend === 'sending'
                      ? 'Sending…'
                      : 'Resend email'}
                </button>
              </p>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit} noValidate>
              <p className="eyebrow">{isRegister ? 'New player' : 'Returning player'}</p>
              <h1 className="form__title">
                {isRegister ? 'Create your library' : 'Welcome back'}
              </h1>
              <p className="form__sub">
                {isRegister
                  ? 'One account to track everything you play.'
                  : 'Pick up right where you left off.'}
              </p>

              <div className="seg" role="group" aria-label="Choose sign in or create account">
                <button
                  type="button"
                  className="seg__btn"
                  aria-pressed={!isRegister}
                  onClick={() => switchMode('login')}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className="seg__btn"
                  aria-pressed={isRegister}
                  onClick={() => switchMode('register')}
                >
                  Create account
                </button>
                <span className="seg__thumb" data-mode={mode} aria-hidden="true" />
              </div>

              <div className="reveal" data-open={isRegister}>
                <div className="reveal__inner">
                  <label className="field" htmlFor="username">
                    <span className="field__label">Username</span>
                    <input
                      id="username"
                      className="field__input"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="player_one"
                      required={isRegister}
                      tabIndex={isRegister ? 0 : -1}
                    />
                  </label>
                </div>
              </div>

              <label className="field" htmlFor="email">
                <span className="field__label">Email</span>
                <input
                  id="email"
                  className="field__input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="field" htmlFor="password">
                <span className="field__label">Password</span>
                <input
                  id="password"
                  className="field__input"
                  type="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? 'At least 6 characters' : '••••••••'}
                  minLength={isRegister ? 6 : undefined}
                  required
                />
              </label>

              {error && (
                <p className="form__error" role="alert">
                  {error}
                </p>
              )}

              {unverified && (
                <p className="form__switch">
                  <button
                    type="button"
                    className="link"
                    onClick={handleResend}
                    disabled={resend === 'sending'}
                  >
                    {resend === 'sent'
                      ? 'Verification email sent'
                      : resend === 'sending'
                        ? 'Sending…'
                        : 'Resend verification email'}
                  </button>
                </p>
              )}

              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'One sec…' : isRegister ? 'Create account' : 'Sign in'}
              </button>

              <p className="form__switch">
                {isRegister ? 'Already playing?' : 'New to Hatsu?'}{' '}
                <button
                  type="button"
                  className="link"
                  onClick={() => switchMode(isRegister ? 'login' : 'register')}
                >
                  {isRegister ? 'Sign in' : 'Create an account'}
                </button>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
