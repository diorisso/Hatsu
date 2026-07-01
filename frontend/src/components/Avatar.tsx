import './avatar.css'

function initials(name: string): string {
  const parts = name.trim().split(/[\s_]+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + second).toUpperCase() || '?'
}

interface AvatarProps {
  name: string
  src: string | null
  size?: number
}

export function Avatar({ name, src, size = 32 }: AvatarProps) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {src ? (
        <img src={src} alt="" />
      ) : (
        <span className="avatar__initials">{initials(name)}</span>
      )}
    </span>
  )
}
