import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock3, RotateCcw, Trophy, XCircle } from 'lucide-react'
import { useUser } from '../context/UserContext'
import {
  checkDailyChallengeAnswer,
  ensureBackendProfile,
  finishDailyChallengeAttempt,
  getBestDailyChallengeResult,
  getDailyChallengeHistory,
  getTodayChallenge,
  startDailyChallengeAttempt,
  type DailyChallenge,
  type GameAttempt,
} from '../api/dailyChallenge'
import '../styles/daily-challenge.css'

type Attempt = {
  date: string
  score: number
  elapsedSeconds: number
  completedAt: string
}

type GameStatus = 'loading' | 'intro' | 'playing' | 'finished'

const FEEDBACK_DELAY_MS = 550

function mapAttempt(attempt: GameAttempt): Attempt {
  return {
    date: attempt.finishedAt.slice(0, 10),
    score: attempt.correctCount,
    elapsedSeconds: Math.min(30, Math.ceil(attempt.durationMs / 1000)),
    completedAt: attempt.finishedAt,
  }
}

function DailyChallengePage() {
  const { user } = useUser()
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [status, setStatus] = useState<GameStatus>('loading')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [pausedMs, setPausedMs] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [completedElapsedMs, setCompletedElapsedMs] = useState(0)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [bestToday, setBestToday] = useState<Attempt | null>(null)
  const answersRef = useRef<string[]>([])
  const sessionIdRef = useRef<string | null>(null)
  const finishInProgressRef = useRef(false)

  const date = challenge?.challengeDate ?? ''
  const questionCount = challenge?.questionCount ?? 5
  const timeLimit = challenge?.timeLimitSeconds ?? 30
  const timeLimitMs = timeLimit * 1000
  const questions = challenge?.questions ?? []
  const currentQuestion = questions[questionIndex]

  const loadChallenge = useCallback(async () => {
    setStatus('loading')
    setLoadingError(null)
    try {
      const currentUser = user ?? {
        username: 'Gość',
        email: 'guest@geovia.local',
        avatar: null,
        bio: '',
        city: '',
        visibility: 'private',
      }
      const [challengeData, profile] = await Promise.all([
        getTodayChallenge(),
        ensureBackendProfile(currentUser),
      ])
      setChallenge(challengeData)
      setProfileId(profile.id)

      const history = await getDailyChallengeHistory(profile.id)
      const mappedAttempts = history.attempts.map(mapAttempt)
      setAttempts(mappedAttempts)

      try {
        const best = await getBestDailyChallengeResult(challengeData.id, profile.id)
        setBestToday(mapAttempt(best))
      } catch (error) {
        if (error instanceof Error && !error.message.includes('404')) throw error
        setBestToday(null)
      }
      setStatus('intro')
    } catch (error) {
      setLoadingError(error instanceof Error ? error.message : 'Nie udało się pobrać wyzwania dnia.')
      setStatus('loading')
    }
  }, [user])

  useEffect(() => {
    void loadChallenge()
  }, [loadChallenge])

  const todayAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.date === date),
    [attempts, date],
  )

  const bestAttempt = useMemo(() => {
    if (bestToday) return bestToday
    return todayAttempts.reduce<Attempt | null>((best, attempt) => {
      if (!best || attempt.score > best.score || (attempt.score === best.score && attempt.elapsedSeconds < best.elapsedSeconds)) return attempt
      return best
    }, null)
  }, [bestToday, todayAttempts])

  const refreshHistory = useCallback(async () => {
    if (!profileId || !challenge) return
    const history = await getDailyChallengeHistory(profileId)
    setAttempts(history.attempts.map(mapAttempt))
    try {
      const best = await getBestDailyChallengeResult(challenge.id, profileId)
      setBestToday(mapAttempt(best))
    } catch {
      setBestToday(null)
    }
  }, [challenge, profileId])

  const finishChallenge = useCallback(async (activeElapsedMs: number, totalPausedMs: number) => {
    if (!sessionIdRef.current || finishInProgressRef.current) return
    finishInProgressRef.current = true
    setCompletedElapsedMs(Math.min(timeLimitMs, Math.max(0, activeElapsedMs)))
    setElapsedMs(Math.min(timeLimitMs, Math.max(0, activeElapsedMs)))
    try {
      const result = await finishDailyChallengeAttempt(
        sessionIdRef.current,
        answersRef.current,
        Math.min(7500, Math.max(0, totalPausedMs)),
      )
      setScore(result.correctCount)
      setStatus('finished')
      try {
        await refreshHistory()
      } catch {
        setActionError('Wynik został zapisany, ale nie udało się odświeżyć historii.')
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Nie udało się zapisać wyniku.')
      setStatus('intro')
      finishInProgressRef.current = false
    }
  }, [pausedMs, refreshHistory, timeLimitMs])

  useEffect(() => {
    if (status !== 'playing' || selected || startedAt === null) return
    const timer = window.setInterval(() => {
      const activeElapsed = Math.max(0, Date.now() - startedAt - pausedMs)
      setElapsedMs(activeElapsed)
      if (activeElapsed >= timeLimitMs) {
        void finishChallenge(timeLimitMs, pausedMs)
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [status, selected, startedAt, pausedMs, timeLimitMs, finishChallenge])

  async function startChallenge() {
    if (!challenge || !profileId) return
    setActionError(null)
    setStatus('loading')
    finishInProgressRef.current = false
    try {
      const session = await startDailyChallengeAttempt(challenge.id, profileId)
      sessionIdRef.current = session.attemptSessionId
      answersRef.current = Array.from({ length: questionCount }, () => '')
      setQuestionIndex(0)
      setScore(0)
      setSelected(null)
      setCorrectAnswer(null)
      setPausedMs(0)
      setElapsedMs(0)
      setCompletedElapsedMs(0)
      setStartedAt(Date.parse(session.startedAt))
      setStatus('playing')
    } catch (error) {
      setStatus('intro')
      setActionError(error instanceof Error ? error.message : 'Nie udało się rozpocząć próby.')
    }
  }

  async function chooseAnswer(answer: string) {
    if (selected || status !== 'playing' || startedAt === null || !currentQuestion || !sessionIdRef.current) return
    const answerTime = Date.now()
    const activeElapsedAtAnswer = Math.min(timeLimitMs, Math.max(0, answerTime - startedAt - pausedMs))
    setSelected(answer)
    setActionError(null)

    try {
      const checked = await checkDailyChallengeAnswer(
        sessionIdRef.current,
        currentQuestion.index,
        answer,
      )
      answersRef.current[questionIndex] = answer
      setCorrectAnswer(checked.correctAnswer)
      const nextScore = score + (checked.correct ? 1 : 0)
      setScore(nextScore)

      window.setTimeout(() => {
        const feedbackPause = Date.now() - answerTime
        if (questionIndex + 1 >= questionCount) {
          void finishChallenge(activeElapsedAtAnswer, pausedMs + (Date.now() - answerTime))
        } else {
          setPausedMs((value) => value + feedbackPause)
          setQuestionIndex((index) => index + 1)
          setSelected(null)
          setCorrectAnswer(null)
        }
      }, Math.max(0, FEEDBACK_DELAY_MS - (Date.now() - answerTime)))
    } catch (error) {
      setSelected(null)
      setActionError(error instanceof Error ? error.message : 'Nie udało się sprawdzić odpowiedzi.')
    }
  }

  const elapsedSeconds = Math.min(timeLimit, Math.ceil(completedElapsedMs / 1000))
  const history = [...attempts].reverse()

  return (
    <main className="daily-page">
      <Link to="/" className="back-link"><ArrowLeft size={17} /> Strona główna</Link>
      <section className="daily-header">
        <span className="eyebrow">WYZWANIE DNIA{date ? ` · ${date}` : ''}</span>
        <h1>{challenge?.title ?? 'Stolica w 30 sekund'}</h1>
        <p>Pięć państw, pięć stolic i tylko 30 sekund na zdobycie jak największej liczby punktów.</p>
        <div className="daily-facts">
          <span><Trophy size={16}/> {questionCount} pytań</span>
          <span><Clock3 size={16}/> {timeLimit} sekund</span>
          <span>🌍 Jeden temat</span>
        </div>
      </section>

      <section className="daily-game-card">
        {status === 'loading' && (
          <div className="daily-intro">
            <div className="daily-emblem"><Clock3 size={34}/></div>
            <h2>{loadingError ? 'Nie udało się załadować wyzwania' : 'Ładowanie dzisiejszego wyzwania…'}</h2>
            {loadingError && <p>{loadingError}</p>}
            {loadingError && <button className="primary-button" onClick={() => void loadChallenge()}>Spróbuj ponownie</button>}
          </div>
        )}

        {status === 'intro' && (
          <div className="daily-intro">
            <div className="daily-emblem"><Trophy size={34}/></div>
            <h2>Gotowy na dzisiejsze wyzwanie?</h2>
            <p>Wybierz poprawną stolicę dla każdego państwa. Możesz grać ponownie — zapisujemy każdą próbę.</p>
            {bestAttempt && <p className="daily-best-inline">Twój najlepszy dzisiejszy wynik: <strong>{bestAttempt.score}/{questionCount}</strong> · {bestAttempt.elapsedSeconds}s</p>}
            <button className="primary-button" onClick={() => void startChallenge()}>Rozpocznij wyzwanie <Clock3 size={17}/></button>
            {actionError && <p role="alert">{actionError}</p>}
          </div>
        )}

        {status === 'playing' && currentQuestion && (
          <div className="daily-playing">
            <div className="daily-progress-line">
              <span>Pytanie {questionIndex + 1} z {questionCount}</span>
              <strong className={timeLimit - Math.floor(elapsedMs / 1000) <= 10 ? 'time-warning' : ''}><Clock3 size={17}/> 00:{String(Math.max(0, timeLimit - Math.floor(elapsedMs / 1000))).padStart(2, '0')}</strong>
            </div>
            <div className="daily-progress-track"><span style={{ width: `${(questionIndex / questionCount) * 100}%` }}/></div>
            <span className="eyebrow">JAKA JEST STOLICA PAŃSTWA?</span>
            <h2>{currentQuestion.country}</h2>
            <div className="daily-options">
              {currentQuestion.options.map((option) => {
                const isCorrect = option === correctAnswer
                const isSelected = option === selected
                return (
                  <button
                    key={option}
                    type="button"
                    className={`daily-option${selected && isCorrect ? ' correct' : ''}${isSelected && !isCorrect ? ' incorrect' : ''}`}
                    onClick={() => void chooseAnswer(option)}
                    disabled={Boolean(selected)}
                  >
                    {option}
                    {selected && isCorrect && <CheckCircle2 size={18}/>}
                    {isSelected && correctAnswer && !isCorrect && <XCircle size={18}/>}
                  </button>
                )
              })}
            </div>
            <div className="daily-live-score">Poprawne odpowiedzi: <strong>{score}/{questionCount}</strong></div>
            {actionError && <p role="alert">{actionError}</p>}
          </div>
        )}

        {status === 'finished' && (
          <div className="daily-result">
            <div className="daily-emblem"><Trophy size={34}/></div>
            <span className="eyebrow">WYZWANIE UKOŃCZONE</span>
            <h2>{score} / {questionCount}</h2>
            <p>{score === questionCount ? 'Doskonale! Wszystkie odpowiedzi są poprawne.' : score >= 3 ? 'Dobra robota! Spróbuj jeszcze raz i popraw swój wynik.' : 'Nieźle — kolejna próba może być jeszcze lepsza.'}</p>
            <div className="daily-result-stats">
              <span><strong>{elapsedSeconds}s</strong><small>Czas</small></span>
              <span><strong>{todayAttempts.length}</strong><small>Próby dzisiaj</small></span>
              <span><strong>{bestAttempt?.score ?? score}/{questionCount}</strong><small>Najlepszy wynik</small></span>
            </div>
            <button className="primary-button" onClick={() => void startChallenge()}><RotateCcw size={17}/> Zagraj ponownie</button>
            {actionError && <p role="alert">{actionError}</p>}
          </div>
        )}
      </section>

      <section className="daily-history">
        <div className="daily-history-heading">
          <div><span className="eyebrow">TWOJE WYNIKI</span><h2>Historia wyzwań</h2></div>
          <span>{attempts.length} {attempts.length === 1 ? 'próba' : 'prób'}</span>
        </div>
        {history.length ? (
          <div className="daily-history-list">
            {history.map((attempt, index) => (
              <div className="daily-history-item" key={`${attempt.completedAt}-${index}`}>
                <span>{attempt.date} · próba {history.length - index}</span>
                <strong>{attempt.score}/{questionCount}</strong>
                <span>{attempt.elapsedSeconds} s</span>
                {attempt.date === date && attempt.score === bestAttempt?.score && attempt.elapsedSeconds === bestAttempt?.elapsedSeconds && <span className="daily-record-label">Rekord</span>}
              </div>
            ))}
          </div>
        ) : <p className="daily-empty-history">Nie masz jeszcze zapisanych wyników. Rozpocznij grę, aby zapisać pierwszą próbę.</p>}
      </section>
      <p className="daily-storage-note">Wyniki są zapisywane na Twoim profilu. Rankingi nie są jeszcze dostępne.</p>
    </main>
  )
}

export default DailyChallengePage
