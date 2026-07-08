interface HeartIconProps {
  filled: boolean
  size?: number
  className?: string
}

export function HeartIcon({ filled, size = 18, className }: HeartIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.5S3.5 15 3.5 9.2c0-2.5 1.9-4.2 4.1-4.2 1.7 0 3.2 1 3.9 2.4.7-1.4 2.2-2.4 3.9-2.4 2.2 0 4.1 1.7 4.1 4.2 0 5.8-8.5 11.3-8.5 11.3z" />
    </svg>
  )
}
