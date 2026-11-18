import type { DemoUser } from '../context/UserContext'

const API_BASE = '/api'
const PROFILE_ID_PREFIX = 'geovia.backendProfileId.'

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
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; detail?: string } | null
    throw new Error(body?.message ?? body?.detail ?? `Błąd serwera (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function profileStorageKey(email: string) {
  return `${PROFILE_ID_PREFIX}${email.trim().toLowerCase()}`
}

export async function ensureBackendProfile(user: DemoUser): Promise<BackendProfile> {
  const key = profileStorageKey(user.email)
  const storedId = localStorage.getItem(key)

  if (storedId) {
    try {
      return await request<BackendProfile>(`/profiles/${encodeURIComponent(storedId)}`)
    } catch {
      localStorage.removeItem(key)
    }
  }

  const profile = await request<BackendProfile>('/profiles/ensure', {
    method: 'POST',
    body: JSON.stringify({
      username: user.username,
      avatarUrl: user.avatar,
      bio: user.bio,
      city: user.city,
    }),
  })
  localStorage.setItem(key, profile.id)
  return profile
}

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
