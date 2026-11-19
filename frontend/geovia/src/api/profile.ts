import type { DemoUser } from '../context/UserContext'

const API_BASE = '/api'

export type BackendProfile = {
  id: string
  username: string
  avatarUrl: string | null
  bio: string | null
  city: string | null
  guestImportStatus: string
  createdAt: string
  updatedAt: string
}

export type BackendQuizAttempt = {
  id: string
  categoryId: string
  areaId: string
  modeId: string
  correctCount: number
  totalQuestions: number
  scorePercent: number
  durationMs: number
  status: 'completed' | 'ended-early' | 'time-expired' | string
  startedAt: string
  finishedAt: string
  countryResults: { countryId: string; outcome: 'correct' | 'incorrect' | 'skipped' }[]
}

export type BackendProfileStats = {
  totalAttempts: number
  attemptsLast30Days: number
  totalCorrectAnswers: number
  averageScorePercent: number
  lastAttemptAt: string | null
}

export type BackendCountryKnowledgeItem = {
  countryId: string
  nameStatus: 'unknown' | 'learning' | 'needs-work' | 'mastered'
  capitalStatus: 'unknown' | 'learning' | 'needs-work' | 'mastered'
  flagStatus: 'unknown' | 'learning' | 'needs-work' | 'mastered'
  overallStatus: 'unknown' | 'learning' | 'needs-work' | 'mastered'
  nameEvidence: number
  capitalEvidence: number
  flagEvidence: number
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; detail?: string } | null
    throw new Error(body?.message ?? body?.detail ?? `Błąd serwera (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function ensureBackendProfile(user: DemoUser): Promise<BackendProfile> {
  void user
  return getCurrentAccount().then((account) => account.profile)
}

export type AuthAccount = { id: string; email: string; emailVerified: boolean; profileId: string; username: string; avatarUrl: string | null; bio: string | null; city: string | null }
export type AuthSession = AuthAccount & { profile: BackendProfile }

export async function getCurrentAccount(): Promise<AuthSession> {
  const account = await request<AuthAccount>('/auth/me')
  return { ...account, profile: { id: account.profileId, username: account.username, avatarUrl: account.avatarUrl, bio: account.bio, city: account.city, guestImportStatus: 'pending', createdAt: '', updatedAt: '' } }
}
export function registerAccount(email: string, password: string, username: string) {
  return request<void>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, username }) })
}
export async function loginAccount(email: string, password: string) {
  await request<AuthAccount>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  return getCurrentAccount()
}
export function logoutAccount() { return request<void>('/auth/logout', { method: 'POST' }) }
export function verifyEmailToken(token: string) { return request<void>('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }) }
export function requestEmailChange(email: string) { return request<void>('/auth/email', { method: 'POST', body: JSON.stringify({ email }) }) }
export function changeAccountPassword(currentPassword: string, newPassword: string) { return request<void>('/auth/password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }) }

export async function updateBackendProfile(profileId: string, user: DemoUser): Promise<BackendProfile> {
  return request<BackendProfile>(`/profiles/${encodeURIComponent(profileId)}`, {
    method: 'PUT',
    body: JSON.stringify({
      username: user.username,
      avatarUrl: user.avatar,
      bio: user.bio,
      city: user.city,
    }),
  })
}


export type CreateBackendQuizAttempt = {
  categoryId: string
  areaId: string
  modeId: string
  correctCount: number
  totalQuestions: number
  durationMs: number
  startedAt: string
  finishedAt: string
  status: 'completed' | 'ended-early'
  countryResults?: { countryId: string; outcome: 'correct' | 'incorrect' }[]
}

export function createBackendQuizAttempt(profileId: string, attempt: CreateBackendQuizAttempt) {
  return request<BackendQuizAttempt>('/attempts', {
    method: 'POST',
    body: JSON.stringify({ profileId, ...attempt }),
  })
}

export function getBackendProfile(profileId: string) {
  return request<BackendProfile>(`/profiles/${encodeURIComponent(profileId)}`)
}

export function getBackendProfileStats(profileId: string) {
  return request<BackendProfileStats>(`/profiles/${encodeURIComponent(profileId)}/stats`)
}

export function getBackendProfileAttempts(profileId: string) {
  return request<BackendQuizAttempt[]>(`/profiles/${encodeURIComponent(profileId)}/attempts`)
}

export function getBackendCountryKnowledge(profileId: string) {
  return request<{ countries: BackendCountryKnowledgeItem[] }>(`/profiles/${encodeURIComponent(profileId)}/country-knowledge`)
}
