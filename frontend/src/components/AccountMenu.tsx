import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../session/SessionProvider'
import { Avatar } from './Avatar'
import './account-menu.css'

export function AccountMenu() {
  const { user, signOut } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointer(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const name = user?.username ?? ''
  const avatarUrl = user?.avatarUrl ?? null

  return (
    <div className="account" ref={ref}>
      <button
        type="button"
        className="account__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((current) => !current)}
      >
        <Avatar name={name} src={avatarUrl} size={32} />
      </button>

      {open && (
        <div className="account__menu" role="menu">
          <div className="account__head">
            <Avatar name={name} src={avatarUrl} size={44} />
            <div className="account__id">
              <span className="account__name">{name}</span>
              <span className="account__email">{user?.email}</span>
            </div>
          </div>

          <Link
            to="/profile"
            className="account__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>

          <Link
            to="/settings"
            className="account__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>

          <div className="account__sep" />

          <button
            type="button"
            className="account__item account__item--danger"
            role="menuitem"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
