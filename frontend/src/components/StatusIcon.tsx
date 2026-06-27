import { EntryStatus } from '../api/types'

interface StatusIconProps {
  status: EntryStatus
  className?: string
}

export function StatusIcon({ status, className }: StatusIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {status === EntryStatus.Playing && <path d="M8 5l11 7-11 7z" />}
      {status === EntryStatus.Completed && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12.4l2.4 2.4 4.6-5.2" />
        </>
      )}
      {status === EntryStatus.Backlog && <path d="M7 4h10v16l-5-3-5 3z" />}
      {status === EntryStatus.Dropped && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.3 9.3l5.4 5.4M14.7 9.3l-5.4 5.4" />
        </>
      )}
    </svg>
  )
}
