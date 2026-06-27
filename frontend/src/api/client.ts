import type {
  AuthResponse,
  CreateEntryRequest,
  EntryResponse,
  GameResponse,
  LoginRequest,
  RegisterRequest,
  UpdateEntryRequest,
} from './types'

const TOKEN_KEY = 'hatsu.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  if (init?.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`/api${path}`, { ...init, headers })

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
      request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: LoginRequest) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },
  games: {
    search: (query: string, limit = 10) =>
      request<GameResponse[]>(`/games/search?query=${encodeURIComponent(query)}&limit=${limit}`),
    getById: (id: number) => request<GameResponse>(`/games/${id}`),
  },
  entries: {
    mine: () => request<EntryResponse[]>('/entries/me'),
    byUser: (userId: number) => request<EntryResponse[]>(`/entries/user/${userId}`),
    create: (body: CreateEntryRequest) =>
      request<EntryResponse>('/entries', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: UpdateEntryRequest) =>
      request<EntryResponse>(`/entries/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: number) => request<void>(`/entries/${id}`, { method: 'DELETE' }),
  },
}
