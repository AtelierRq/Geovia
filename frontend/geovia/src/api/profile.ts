import type { DemoUser } from '../context/UserContext'

const API_BASE = '/api'

export type BackendProfile = {
  id: string
  username: string
  avatarUrl: string | null
  bio: string | null
  city: string | null
  visibility: 'private' | 'public'
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
  const headers = new Headers(init?.headers)
  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; detail?: string } | null
    throw new Error(body?.message ?? body?.detail ?? `Błąd serwera (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  const body = await response.text()
  if (!body.trim()) return undefined as T
  return JSON.parse(body) as T
}

export async function ensureBackendProfile(user: DemoUser): Promise<BackendProfile> {
  void user
  return getCurrentAccount().then((account) => account.profile)
}

export type AuthAccount = { id: string; email: string; emailVerified: boolean; profileId: string; username: string; avatarUrl: string | null; bio: string | null; city: string | null; visibility: 'private' | 'public' }
export type AuthSession = AuthAccount & { profile: BackendProfile }

export async function getCurrentAccount(): Promise<AuthSession> {
  const account = await request<AuthAccount>('/auth/me')
  return { ...account, profile: { id: account.profileId, username: account.username, avatarUrl: account.avatarUrl, bio: account.bio, city: account.city, visibility: account.visibility, createdAt: '', updatedAt: '' } }
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
export type AccountSession = { id: string; createdAt: string; expiresAt: string; userAgent: string | null; current: boolean }
export function resendVerification(email: string) { return request<{ message: string }>('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }) }
export function requestPasswordReset(email: string) { return request<{ message: string }>('/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) }) }
export function resetPassword(token: string, newPassword: string) { return request<void>('/auth/password/reset', { method: 'POST', body: JSON.stringify({ token, newPassword }) }) }
export function getAccountSessions() { return request<AccountSession[]>('/auth/sessions') }
export function revokeAccountSession(sessionId: string) { return request<void>(`/auth/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' }) }
export function deleteAccount(email: string, password: string) { return request<void>('/auth/account', { method: 'DELETE', body: JSON.stringify({ email, password }) }) }

export async function updateBackendProfile(profileId: string, user: DemoUser): Promise<BackendProfile> {
  return request<BackendProfile>(`/profiles/${encodeURIComponent(profileId)}`, {
    method: 'PUT',
    body: JSON.stringify({
      username: user.username,
      bio: user.bio,
      city: user.city,
      visibility: user.visibility,
    }),
  })
}

export function uploadProfileAvatar(profileId: string, file: File) {
  const body = new FormData()
  body.append('file', file)
  return request<BackendProfile>(`/profiles/${encodeURIComponent(profileId)}/avatar`, { method: 'PUT', body })
}

export function deleteProfileAvatar(profileId: string) {
  return request<BackendProfile>(`/profiles/${encodeURIComponent(profileId)}/avatar`, { method: 'DELETE' })
}

export type PublicProfile = { username: string; avatarUrl: string | null; bio: string | null; city: string | null }
export function getPublicProfile(username: string) {
  return request<PublicProfile>(`/public/profiles/${encodeURIComponent(username)}`)
}
export type PublicProfileActivity = {
  totalAttempts: number
  attemptsLast30Days: number
  totalCorrectAnswers: number
  averageScorePercent: number
  lastAttemptAt: string | null
  lastCategoryId: string | null
  lastScorePercent: number | null
}
export function getPublicProfileActivity(username: string) {
  return request<PublicProfileActivity>(`/public/profiles/${encodeURIComponent(username)}/activity`)
}

export type FriendProfile = { profileId: string; username: string; avatarUrl: string | null; visibility: 'private' | 'public'; bio: string | null; city: string | null; requestedAt: string }
export type FriendRequestEntry = { requestId: string; profile: FriendProfile }
export type FriendOverview = { friends: FriendProfile[]; incomingRequests: FriendRequestEntry[]; outgoingRequests: FriendRequestEntry[] }
export type FriendSearchResult = Pick<FriendProfile, 'profileId' | 'username' | 'avatarUrl' | 'visibility'> & { relationState: 'none' | 'outgoing-pending' | 'incoming-pending' | 'accepted' }
export function getFriends() { return request<FriendOverview>('/friends') }
export function searchFriends(query: string) { return request<FriendSearchResult[]>(`/friends/search?q=${encodeURIComponent(query)}`) }
export function sendFriendRequest(username: string) { return request<void>('/friends/requests', { method: 'POST', body: JSON.stringify({ username }) }) }
export function acceptFriendRequest(requestId: string) { return request<void>(`/friends/requests/${encodeURIComponent(requestId)}/accept`, { method: 'POST' }) }
export function declineFriendRequest(requestId: string) { return request<void>(`/friends/requests/${encodeURIComponent(requestId)}`, { method: 'DELETE' }) }
export function cancelFriendRequest(requestId: string) { return request<void>(`/friends/requests/${encodeURIComponent(requestId)}/outgoing`, { method: 'DELETE' }) }
export function removeFriend(profileId: string) { return request<void>(`/friends/${encodeURIComponent(profileId)}`, { method: 'DELETE' }) }


export type CreateBackendQuizAttempt = {
  clientAttemptId: string
  categoryId: string
  areaId: string
  modeId: string
  durationMs: number
  startedAt: string
  finishedAt: string
  status: 'completed' | 'ended-early'
  answers: { countryId: string; answer: string }[]
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
