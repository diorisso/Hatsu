import { Link } from 'react-router-dom'
import type { UserSummary } from '../api/types'
import { Avatar } from './Avatar'
import './user-row.css'

interface UserRowProps {
  user: UserSummary
  onNavigate?: () => void
}

export function UserRow({ user, onNavigate }: UserRowProps) {
  return (
    <Link to={`/u/${encodeURIComponent(user.username)}`} className="user-row" onClick={onNavigate}>
      <Avatar name={user.username} src={user.avatarUrl} size={40} />
      <div className="user-row__body">
        <span className="user-row__name">{user.username}</span>
        {user.bio && <span className="user-row__bio">{user.bio}</span>}
      </div>
      <svg
        className="user-row__chev"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  )
}
