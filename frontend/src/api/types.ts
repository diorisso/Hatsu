export const GameType = {
  MainGame: 0,
  DlcAddon: 1,
  Expansion: 2,
  Bundle: 3,
  StandaloneExpansion: 4,
  Mod: 5,
  Episode: 6,
  Season: 7,
  Remake: 8,
  Remaster: 9,
  ExpandedGame: 10,
  Port: 11,
  Fork: 12,
  Pack: 13,
  Update: 14,
} as const

export type GameType = (typeof GameType)[keyof typeof GameType]

export const EntryStatus = {
  Playing: 0,
  Completed: 1,
  Backlog: 2,
  Dropped: 3,
} as const

export type EntryStatus = (typeof EntryStatus)[keyof typeof EntryStatus]

export interface CompanySummary {
  id: number
  name: string
}

export interface PlatformSummary {
  id: number
  name: string
}

export interface GameResponse {
  id: number
  type: GameType
  name: string
  summary: string | null
  coverUrl: string | null
  releaseDate: string | null
  developer: CompanySummary | null
  publisher: CompanySummary | null
  platforms: PlatformSummary[]
}

export interface EntryResponse {
  id: number
  userId: number
  gameId: number
  status: EntryStatus
  rating: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  expiresAt: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateEntryRequest {
  gameId: number
  status?: EntryStatus
  rating?: number | null
  notes?: string | null
}

export interface UpdateEntryRequest {
  status?: EntryStatus
  rating?: number | null
  notes?: string | null
}
