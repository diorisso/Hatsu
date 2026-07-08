import type {
  AuthResponse,
  CreateEntryRequest,
  EntryResponse,
  GameDetailViewModel,
  LibraryViewModel,
  LoginRequest,
  ProfileViewModel,
  RegisterRequest,
  RegisterResponse,
  SearchResult,
  UpdateEntryRequest,
  UserResponse,
  UserSummary,
} from './types'

const TOKEN_KEY = 'hatsu.token'
const REFRESH_TOKEN_KEY = 'hatsu.refreshToken'
const API_BASE = import.meta.env.VITE_API_URL ?? ''

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(auth: AuthResponse | null): void {
  if (auth) {
    localStorage.setItem(TOKEN_KEY, auth.token)
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken)
  } else {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

let refreshPromise: Promise<string | null> | null = null

function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.resolve(null)

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!response.ok) return null
        const auth = (await response.json()) as AuthResponse
        setTokens(auth)
        return auth.token
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  if (init?.body && !(init.body instanceof FormData))
    headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE}/api${path}`, { ...init, headers })

  if (response.status === 401 && retry && getRefreshToken()) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return request<T>(path, init, false)
    setTokens(null)
    onUnauthorized?.()
  }

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      // response had no JSON body
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  auth: {
    register: (body: RegisterRequest) =>
      request<RegisterResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: LoginRequest) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: (refreshToken: string) =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    verify: (token: string) =>
      request<AuthResponse>(`/auth/verify?token=${encodeURIComponent(token)}`),
    resend: (email: string) =>
      request<{ message: string }>('/auth/resend', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },
  games: {
    search: (query: string, limit = 10) =>
      request<SearchResult[]>(`/games/search?query=${encodeURIComponent(query)}&limit=${limit}`),
    detail: (id: number) => request<GameDetailViewModel>(`/games/${id}`),
  },
  profile: {
    me: () => request<ProfileViewModel>('/profile/me'),
    byUsername: (username: string) =>
      request<ProfileViewModel>(`/profile/${encodeURIComponent(username)}`),
  },
  library: {
    me: () => request<LibraryViewModel>('/library/me'),
  },
  users: {
    me: () => request<UserResponse>('/users/me'),
    search: (query: string, limit = 10) =>
      request<UserSummary[]>(
        `/users/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      ),
    updateProfile: (body: { username: string; bio: string | null }) =>
      request<UserResponse>('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      request<void>('/users/me/password', { method: 'POST', body: JSON.stringify(body) }),
    uploadAvatar: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request<UserResponse>('/users/me/avatar', { method: 'POST', body: form })
    },
    removeAvatar: () => request<UserResponse>('/users/me/avatar', { method: 'DELETE' }),
    uploadBanner: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request<UserResponse>('/users/me/banner', { method: 'POST', body: form })
    },
    removeBanner: () => request<UserResponse>('/users/me/banner', { method: 'DELETE' }),
  },
  favorites: {
    add: (gameId: number) =>
      request<void>('/favorites', { method: 'POST', body: JSON.stringify({ gameId }) }),
    remove: (gameId: number) => request<void>(`/favorites/${gameId}`, { method: 'DELETE' }),
  },
  follows: {
    follow: (username: string) =>
      request<void>(`/follows/${encodeURIComponent(username)}`, { method: 'POST' }),
    unfollow: (username: string) =>
      request<void>(`/follows/${encodeURIComponent(username)}`, { method: 'DELETE' }),
    followers: (username: string) =>
      request<UserSummary[]>(`/follows/${encodeURIComponent(username)}/followers`),
    following: (username: string) =>
      request<UserSummary[]>(`/follows/${encodeURIComponent(username)}/following`),
  },
  entries: {
    create: (body: CreateEntryRequest) =>
      request<EntryResponse>('/entries', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: UpdateEntryRequest) =>
      request<EntryResponse>(`/entries/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: number) => request<void>(`/entries/${id}`, { method: 'DELETE' }),
  },
}
