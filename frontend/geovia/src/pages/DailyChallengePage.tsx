import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock3, RotateCcw, Trophy, XCircle } from 'lucide-react'
import { capitals } from '../data/capitals'
import { countries } from '../data/countries'
import { useUser } from '../context/UserContext'
import '../styles/daily-challenge.css'

type Question = {
  country: string
  answer: string
  options: string[]
}

type Attempt = {
  date: string
  score: number
  elapsedSeconds: number
  completedAt: string
}

const ATTEMPTS_KEY = 'geovia.dailyChallenge.attempts'
const QUESTION_COUNT = 5
const TIME_LIMIT = 30
const TIME_LIMIT_MS = TIME_LIMIT * 1000

function todayKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function seededShuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

function dailyQuestions(date: string): Question[] {
  const seed = Number(date.replaceAll('-', ''))
  const random = seededRandom(seed)
  const pool = capitals
    .map((capital) => ({
      country: countries.find((country) => country.id === capital.countryId)?.name,
      answer: capital.name,
    }))
    .filter((item): item is { country: string; answer: string } => Boolean(item.country))
  const shuffled = seededShuffle(pool, random)
  return shuffled.slice(0, QUESTION_COUNT).map((item) => {
    const distractors = seededShuffle([...new Set(pool
      .filter((candidate) => candidate.answer !== item.answer)
      .map((candidate) => candidate.answer))], random).slice(0, 3)
    return {
      country: item.country,
      answer: item.answer,
      options: seededShuffle([...distractors, item.answer], random),
    }
  })
}

function readAttempts(key: string): Attempt[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function DailyChallengePage() {
  const { user } = useUser()
  const date = todayKey()
  const storageKey = `${ATTEMPTS_KEY}.${user?.email ?? 'guest'}`
  const questions = useMemo(() => dailyQuestions(date), [date])
  const [attempts, setAttempts] = useState<Attempt[]>(() => readAttempts(storageKey))
  const [status, setStatus] = useState<'intro' | 'playing' | 'finished'>('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [pausedMs, setPausedMs] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [completedElapsedMs, setCompletedElapsedMs] = useState(0)

  useEffect(() => {
    setAttempts(readAttempts(storageKey))
  }, [storageKey])

  useEffect(() => {
    if (status !== 'playing' || selected || startedAt === null) return
    const timer = window.setInterval(() => {
      const activeElapsed = Math.max(0, Date.now() - startedAt - pausedMs)
      setElapsedMs(activeElapsed)
      if (activeElapsed >= TIME_LIMIT_MS) {
        const elapsedSeconds = TIME_LIMIT
        const attempt: Attempt = {
          date,
          score,
          elapsedSeconds,
          completedAt: new Date().toISOString(),
        }
        const next = [...attempts, attempt].slice(-100)
        localStorage.setItem(storageKey, JSON.stringify(next))
        setAttempts(next)
        setCompletedElapsedMs(TIME_LIMIT_MS)
        setStatus('finished')
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [status, selected, startedAt, pausedMs, score, attempts, storageKey, date])

  const currentQuestion = questions[questionIndex]
  const todayAttempts = attempts.filter((attempt) => attempt.date === date)
  const bestAttempt = todayAttempts.reduce<Attempt | null>((best, attempt) => {
    if (!best || attempt.score > best.score || (attempt.score === best.score && attempt.elapsedSeconds < best.elapsedSeconds)) return attempt
    return best
  }, null)

  function startChallenge() {
    setQuestionIndex(0)
    setScore(0)
    setSelected(null)
    setPausedMs(0)
    setElapsedMs(0)
    setCompletedElapsedMs(0)
    setStartedAt(Date.now())
    setStatus('playing')
  }

  function finishChallenge(finalScore: number, activeElapsedMs: number) {
    const safeElapsedMs = Math.min(TIME_LIMIT_MS, Math.max(0, activeElapsedMs))
    const elapsedSeconds = Math.min(TIME_LIMIT, Math.ceil(safeElapsedMs / 1000))
    const attempt: Attempt = {
      date,
      score: finalScore,
      elapsedSeconds,
      completedAt: new Date().toISOString(),
    }
    const next = [...attempts, attempt].slice(-100)
    localStorage.setItem(storageKey, JSON.stringify(next))
    setAttempts(next)
    setCompletedElapsedMs(safeElapsedMs)
    setElapsedMs(safeElapsedMs)
    setStatus('finished')
  }

  function chooseAnswer(answer: string) {
    if (selected || status !== 'playing' || startedAt === null) return
    const answerTime = Date.now()
    const activeElapsedAtAnswer = Math.min(TIME_LIMIT_MS, Math.max(0, answerTime - startedAt - pausedMs))
    setSelected(answer)
    const nextScore = score + (answer === currentQuestion.answer ? 1 : 0)
    setScore(nextScore)
    if (questionIndex + 1 >= QUESTION_COUNT) {
      window.setTimeout(() => finishChallenge(nextScore, activeElapsedAtAnswer), 550)
    } else {
      window.setTimeout(() => {
        setPausedMs((value) => value + (Date.now() - answerTime))
        setQuestionIndex((index) => index + 1)
        setSelected(null)
      }, 550)
    }
  }

  const elapsedSeconds = Math.min(TIME_LIMIT, Math.ceil(completedElapsedMs / 1000))
  const history = [...attempts].reverse()

  return (
    <main className="daily-page">
      <Link to="/" className="back-link"><ArrowLeft size={17} /> Strona główna</Link>
      <section className="daily-header">
        <span className="eyebrow">WYZWANIE DNIA · {date}</span>
        <h1>Stolica w 30 sekund</h1>
        <p>Pięć państw, pięć stolic i tylko 30 sekund na zdobycie jak największej liczby punktów.</p>
        <div className="daily-facts">
          <span><Trophy size={16}/> 5 pytań</span>
          <span><Clock3 size={16}/> 30 sekund</span>
          <span>🌍 Jeden temat</span>
        </div>
      </section>

      <section className="daily-game-card">
        {status === 'intro' && (
          <div className="daily-intro">
            <div className="daily-emblem"><Trophy size={34}/></div>
            <h2>Gotowy na dzisiejsze wyzwanie?</h2>
            <p>Wybierz poprawną stolicę dla każdego państwa. Możesz grać ponownie — zapisujemy każdą próbę.</p>
            {bestAttempt && <p className="daily-best-inline">Twój najlepszy dzisiejszy wynik: <strong>{bestAttempt.score}/5</strong> · {bestAttempt.elapsedSeconds}s</p>}
            <button className="primary-button" onClick={startChallenge}>Rozpocznij wyzwanie <Clock3 size={17}/></button>
          </div>
        )}

        {status === 'playing' && currentQuestion && (
          <div className="daily-playing">
            <div className="daily-progress-line">
              <span>Pytanie {questionIndex + 1} z {QUESTION_COUNT}</span>
              <strong className={TIME_LIMIT - Math.floor(elapsedMs / 1000) <= 10 ? 'time-warning' : ''}><Clock3 size={17}/> 00:{String(Math.max(0, TIME_LIMIT - Math.floor(elapsedMs / 1000))).padStart(2, '0')}</strong>
            </div>
            <div className="daily-progress-track"><span style={{ width: `${(questionIndex / QUESTION_COUNT) * 100}%` }}/></div>
            <span className="eyebrow">JAKA JEST STOLICA PAŃSTWA?</span>
            <h2>{currentQuestion.country}</h2>
            <div className="daily-options">
              {currentQuestion.options.map((option) => {
                const isCorrect = option === currentQuestion.answer
                const isSelected = option === selected
                return (
                  <button
                    key={option}
                    type="button"
                    className={`daily-option${selected && isCorrect ? ' correct' : ''}${isSelected && !isCorrect ? ' incorrect' : ''}`}
                    onClick={() => chooseAnswer(option)}
                    disabled={Boolean(selected)}
                  >
                    {option}
                    {selected && isCorrect && <CheckCircle2 size={18}/>}
                    {isSelected && !isCorrect && <XCircle size={18}/>}
                  </button>
                )
              })}
            </div>
            <div className="daily-live-score">Poprawne odpowiedzi: <strong>{score}/{QUESTION_COUNT}</strong></div>
          </div>
        )}

        {status === 'finished' && (
          <div className="daily-result">
            <div className="daily-emblem"><Trophy size={34}/></div>
            <span className="eyebrow">WYZWANIE UKOŃCZONE</span>
            <h2>{score} / {QUESTION_COUNT}</h2>
            <p>{score === 5 ? 'Doskonale! Wszystkie odpowiedzi są poprawne.' : score >= 3 ? 'Dobra robota! Spróbuj jeszcze raz i popraw swój wynik.' : 'Nieźle — kolejna próba może być jeszcze lepsza.'}</p>
            <div className="daily-result-stats">
              <span><strong>{elapsedSeconds}s</strong><small>Czas</small></span>
              <span><strong>{todayAttempts.length}</strong><small>Próby dzisiaj</small></span>
              <span><strong>{bestAttempt?.score ?? score}/5</strong><small>Najlepszy wynik</small></span>
            </div>
            <button className="primary-button" onClick={startChallenge}><RotateCcw size={17}/> Zagraj ponownie</button>
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
                <strong>{attempt.score}/5</strong>
                <span>{attempt.elapsedSeconds} s</span>
                {attempt.date === date && attempt.score === bestAttempt?.score && attempt.elapsedSeconds === bestAttempt?.elapsedSeconds && <span className="daily-record-label">Rekord</span>}
              </div>
            ))}
          </div>
        ) : <p className="daily-empty-history">Nie masz jeszcze zapisanych wyników. Rozpocznij grę, aby zapisać pierwszą próbę.</p>}
      </section>
      <p className="daily-storage-note">Wyniki są na razie zapisywane w tej przeglądarce. Rankingi nie są jeszcze dostępne.</p>
    </main>
  )
}

export default DailyChallengePage
