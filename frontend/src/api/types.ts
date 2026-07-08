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

export interface GenreSummary {
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
  genres: GenreSummary[]
}

export interface EntryResponse {
  id: number
  gameId: number
  status: EntryStatus
  rating: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface GameSummary {
  id: number
  type: GameType
  name: string
  coverUrl: string | null
  releaseDate: string | null
  developer: CompanySummary | null
  genres: GenreSummary[]
}

export interface EntryViewModel {
  id: number
  status: EntryStatus
  rating: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  game: GameSummary | null
}

export interface ProfileUser {
  username: string
  avatarUrl: string | null
  bannerUrl: string | null
  bio: string | null
}

export interface ProfileViewModel {
  user: ProfileUser
  isSelf: boolean
  isFollowing: boolean
  followerCount: number
  followingCount: number
  entries: EntryViewModel[]
  favorites: GameSummary[]
}

export interface UserSummary {
  username: string
  avatarUrl: string | null
  bio: string | null
}

export interface LibraryViewModel {
  entries: EntryViewModel[]
  favoriteGameIds: number[]
}

export interface EntryState {
  id: number
  status: EntryStatus
  rating: number | null
  notes: string | null
}

export interface GameDetailViewModel {
  game: GameResponse
  entry: EntryState | null
  isFavorite: boolean
}

export interface SearchResult {
  game: GameResponse
  status: EntryStatus | null
}

export interface AuthResponse {
  token: string
  expiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export interface RegisterResponse {
  email: string
  message: string
}

export interface UserResponse {
  username: string
  email: string
  avatarUrl: string | null
  bannerUrl: string | null
  bio: string | null
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
