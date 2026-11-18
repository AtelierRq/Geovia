import { ensureBackendProfile as ensureProfile } from './profile'

const API_BASE = '/api'

export type DailyChallengeQuestion = {
  index: number
  country: string
  options: string[]
}

export type DailyChallenge = {
  id: string
  challengeDate: string
  title: string
  questionCount: number
  timeLimitSeconds: number
  questions: DailyChallengeQuestion[]
}

export type AttemptSession = {
  attemptSessionId: string
  startedAt: string
  timeLimitSeconds: number
}

export type GameAttempt = {
  id: string
  challengeId: string
  correctCount: number
  totalQuestions: number
  scorePercent: number
  durationMs: number
  status: string
  startedAt: string
  finishedAt: string
}

export type DailyChallengeHistory = {
  attempts: GameAttempt[]
  bestAttempt: GameAttempt | null
}

export type CheckedAnswer = {
  correct: boolean
  correctAnswer: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; detail?: string } | null
    throw new Error(`Błąd serwera (${response.status}): ${body?.message ?? body?.detail ?? response.statusText}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getTodayChallenge() {
  return request<DailyChallenge>('/daily-challenges/today')
}

export async function ensureBackendProfile(user: import('../context/UserContext').DemoUser): Promise<{ id: string }> {
  const profile = await ensureProfile(user)
  return { id: profile.id }
}

export function startDailyChallengeAttempt(challengeId: string, profileId: string) {
  return request<AttemptSession>(`/daily-challenges/${challengeId}/attempts/start`, {
    method: 'POST',
    body: JSON.stringify({ profileId }),
  })
}

export function checkDailyChallengeAnswer(
  sessionId: string,
  questionIndex: number,
  answer: string,
) {
  return request<CheckedAnswer>(`/daily-challenges/attempts/${sessionId}/answers/check`, {
    method: 'POST',
    body: JSON.stringify({ questionIndex, answer }),
  })
}

export function finishDailyChallengeAttempt(
  sessionId: string,
  answers: string[],
  pausedDurationMs: number,
) {
  return request<GameAttempt>(`/daily-challenges/attempts/${sessionId}/finish`, {
    method: 'POST',
    body: JSON.stringify({ answers, pausedDurationMs }),
  })
}

export function getDailyChallengeHistory(profileId: string) {
  return request<DailyChallengeHistory>(`/daily-challenges/history?profileId=${encodeURIComponent(profileId)}`)
}

export function getBestDailyChallengeResult(challengeId: string, profileId: string) {
  return request<GameAttempt>(
    `/daily-challenges/${challengeId}/best-result?profileId=${encodeURIComponent(profileId)}`,
  )
}
