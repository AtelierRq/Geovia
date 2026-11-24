import { useCallback, useRef, useState } from 'react'
import { ensureBackendProfile, createBackendQuizAttempt, type CreateBackendQuizAttempt } from '../api/profile'
import type { DemoUser } from '../context/UserContext'

const RESULTS_KEY = 'geovia.quizResults'

export type QuizSaveStatus = 'idle' | 'saving' | 'saved' | 'saved-local' | 'error'

type PendingSave = {
  result: object
  user: DemoUser | null
  attempt: CreateBackendQuizAttempt
}

function saveGuestResult(result: object) {
  const stored = localStorage.getItem(RESULTS_KEY)
  const previous: unknown = stored ? JSON.parse(stored) : []
  if (!Array.isArray(previous)) throw new Error('Lokalna historia quizów ma nieprawidłowy format.')
  localStorage.setItem(RESULTS_KEY, JSON.stringify([...previous, result]))
}

function readableSaveError(error: unknown) {
  if (!(error instanceof Error)) return 'Sprawdź połączenie i spróbuj ponownie.'
  if (/failed to fetch|networkerror|load failed/i.test(error.message)) {
    return 'Nie można połączyć się z backendem. Sprawdź, czy backend jest uruchomiony.'
  }
  if (/\(401\)|authentication required|unauthorized/i.test(error.message)) {
    return 'Sesja mogła wygasnąć. Zaloguj się ponownie i spróbuj jeszcze raz.'
  }
  if (/\(5\d\d\)/.test(error.message)) return 'Backend zwrócił błąd. Spróbuj ponownie za chwilę.'
  return error.message || 'Sprawdź połączenie i spróbuj ponownie.'
}

export function useQuizAttemptPersistence() {
  const [status, setStatus] = useState<QuizSaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const pendingRef = useRef<PendingSave | null>(null)
  const statusRef = useRef<QuizSaveStatus>('idle')
  const lastAttemptIdRef = useRef<string | null>(null)

  const updateStatus = useCallback((next: QuizSaveStatus) => {
    statusRef.current = next
    setStatus(next)
  }, [])

  const executeSave = useCallback(async (pending: PendingSave) => {
    setErrorMessage('')
    if (!pending.user) {
      try {
        saveGuestResult(pending.result)
        pendingRef.current = null
        updateStatus('saved-local')
      } catch (error) {
        setErrorMessage(error instanceof Error ? `Nie udało się zapisać lokalnej historii. ${error.message}` : 'Nie udało się zapisać wyniku w tej przeglądarce.')
        updateStatus('error')
      }
      return
    }

    updateStatus('saving')
    try {
      const profile = await ensureBackendProfile(pending.user)
      await createBackendQuizAttempt(profile.id, pending.attempt)
      pendingRef.current = null
      updateStatus('saved')
    } catch (error) {
      setErrorMessage(readableSaveError(error))
      updateStatus('error')
    }
  }, [updateStatus])

  const saveAttempt = useCallback((result: object, user: DemoUser | null, attempt: CreateBackendQuizAttempt) => {
    if (statusRef.current === 'saving') return
    const attemptId = 'id' in result && typeof result.id === 'string' ? result.id : null
    if (attemptId && lastAttemptIdRef.current === attemptId) return
    lastAttemptIdRef.current = attemptId
    const pending = { result, user, attempt }
    pendingRef.current = pending
    void executeSave(pending)
  }, [executeSave])

  const retry = useCallback(() => {
    const pending = pendingRef.current
    if (!pending || statusRef.current === 'saving') return
    void executeSave(pending)
  }, [executeSave])

  return { status, errorMessage, saveAttempt, retry }
}
