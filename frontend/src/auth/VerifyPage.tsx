import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useSession } from '../session/SessionProvider'
import './auth.css'

export function VerifyPage() {
  const { signIn } = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [error, setError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    if (!token) {
      setError('This verification link is missing its token.')
      return
    }

    api.auth
      .verify(token)
      .then((result) => {
        signIn(result.token)
        navigate('/', { replace: true })
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'We could not verify this link.')
      })
  }, [token, signIn, navigate])

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="form" style={{ maxWidth: 380, textAlign: 'center' }}>
        <span className="wordmark" style={{ justifyContent: 'center' }}>
          Hatsu<i className="wordmark__dot" aria-hidden="true" />
        </span>
        <p className="eyebrow">Email verification</p>
        {error ? (
          <>
            <h1 className="form__title">This link didn&rsquo;t work</h1>
            <p className="form__sub">{error}</p>
            <p className="form__switch">
              <Link className="link" to="/login">
                Back to sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="form__title">Verifying your email…</h1>
            <p className="form__sub">Hang tight, this only takes a second.</p>
          </>
        )}
      </div>
    </div>
  )
}
