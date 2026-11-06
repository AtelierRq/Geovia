import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Clock3, Flag, Trophy, XCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { categories } from '../data/categories'
import { areas } from '../data/areas'
import { countries, normalizeCountryName } from '../data/countries'
import { countryFlags } from '../data/countryFlags'
import '../styles/quiz-common.css'
import '../styles/capital-quiz.css'
import '../styles/flag-quiz.css'

type Result = {
  id: string
  categoryId: string
  areaId: string
  modeId: string
  completed: number
  total: number
  percentage: number
  elapsedSeconds: number
  endedAt: string
  status: 'completed' | 'ended-early'
  foundCountries: string[]
}

const RESULTS_KEY = 'geovia.quizResults'

const baseQuizItems = countryFlags
  .map((flag) => {
    const country = countries.find((item) => item.id === flag.countryId)
    return country ? { ...flag, countryName: country.name, aliases: country.aliases ?? [] } : null
  })
  .filter((item): item is NonNullable<typeof item> => item !== null)

function shuffleItems<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

function TypeFlagPage() {
  const { categoryId = 'flags', areaId = 'world', modeId = 'name-flag' } = useParams()
  const category = categories.find((item) => item.id === categoryId)
  const area = areas.find((item) => item.id === areaId)
  const [remainingItems, setRemainingItems] = useState(() => shuffleItems(baseQuizItems))
  const [answer, setAnswer] = useState('')
  const [foundIds, setFoundIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [endedResult, setEndedResult] = useState<Result | null>(null)
  const current = remainingItems[0]
  const elapsedSeconds = startedAt === null ? 0 : Math.floor((now - startedAt) / 1000)
  const isEnded = endedResult !== null

  useEffect(() => {
    if (startedAt === null || isEnded) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [startedAt, isEnded])

  function persistResult(result: Result) {
    try {
      const previous = JSON.parse(localStorage.getItem(RESULTS_KEY) ?? '[]') as Result[]
      localStorage.setItem(RESULTS_KEY, JSON.stringify([...previous, result]))
    } catch {
      // Keep the result visible even when browser storage is unavailable.
    }
    setEndedResult(result)
  }

  function saveResult(status: Result['status']) {
    if (endedResult) return
    const result: Result = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      categoryId, areaId, modeId,
      completed: foundIds.length,
      total: baseQuizItems.length,
      percentage: Math.round((foundIds.length / baseQuizItems.length) * 100),
      elapsedSeconds: startedAt === null ? 0 : Math.floor((Date.now() - startedAt) / 1000),
      endedAt: new Date().toISOString(),
      status,
      foundCountries: foundIds,
    }
    persistResult(result)
  }

  function skipCurrent() {
    if (isEnded || !current) return
    if (startedAt === null) {
      setStartedAt(Date.now())
      setNow(Date.now())
    }
    setAnswer('')
    setRemainingItems((items) => [...items.slice(1), items[0]])
    setFeedback({ type: 'info', text: `Pominięto na razie: ${current.countryName}. Ta flaga wróci na końcu kolejki.` })
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isEnded || !current) return
    const normalized = normalizeCountryName(answer)
    if (!normalized) return

    const acceptedNames = [current.countryName, ...current.aliases]
    if (acceptedNames.some((name) => normalizeCountryName(name) === normalized)) {
      const nextFoundIds = [...foundIds, current.countryId]
      const nextItems = remainingItems.slice(1)
      if (startedAt === null) {
        setStartedAt(Date.now())
        setNow(Date.now())
      }
      setFoundIds(nextFoundIds)
      setRemainingItems(nextItems)
      setFeedback({ type: 'success', text: `Dobrze! To flaga państwa ${current.countryName}.` })
      setAnswer('')

      if (nextItems.length === 0) {
        const result: Result = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          categoryId, areaId, modeId,
          completed: baseQuizItems.length,
          total: baseQuizItems.length,
          percentage: 100,
          elapsedSeconds: startedAt === null ? 0 : Math.floor((Date.now() - startedAt) / 1000),
          endedAt: new Date().toISOString(),
          status: 'completed',
          foundCountries: nextFoundIds,
        }
        persistResult(result)
      }
    } else {
      if (startedAt === null) {
        setStartedAt(Date.now())
        setNow(Date.now())
      }
      setFeedback({ type: 'error', text: 'To nie to państwo. Spróbuj ponownie.' })
    }
  }

  if (!category || !area || categoryId !== 'flags' || areaId !== 'world' || modeId !== 'name-flag') {
    return (
      <main className="catalog-page">
        <section className="catalog-heading">
          <h1>Ten quiz nie jest dostępny</h1>
          <p>Tryb „Rozpoznaj flagę” jest obecnie dostępny dla państw całego świata.</p>
          <Link to="/quizzes" className="primary-button">Wróć do katalogu</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="quiz-page">
      <Link to={`/categories/${category.id}/areas/${area.id}/modes`} className="back-link quiz-back">
        <ArrowLeft size={17} /> Wróć do trybów
      </Link>

      {endedResult ? (
        <section className="quiz-result-card">
          <span className="quiz-result-icon"><Trophy size={34} /></span>
          <span className="eyebrow">QUIZ ZAKOŃCZONY</span>
          <h1>{endedResult.status === 'completed' ? 'Gratulacje! Rozpoznano wszystkie flagi.' : 'Wynik quizu'}</h1>
          <div className="quiz-result-score">{endedResult.completed}/{endedResult.total}</div>
          <p>Poprawne odpowiedzi: <strong>{endedResult.percentage}%</strong></p>
          <p>Czas: <strong>{formatTime(endedResult.elapsedSeconds)}</strong></p>
          <p className="quiz-result-note">Wynik został zapisany w tej przeglądarce. Po zakończeniu nie można kontynuować tej próby.</p>
          <div className="quiz-result-actions">
            <button type="button" className="primary-button" onClick={() => window.location.assign(`/quiz/${category.id}/${area.id}/${modeId}`)}>Rozpocznij nowy quiz</button>
            <Link to={`/categories/${category.id}/areas/${area.id}/modes`} className="secondary-button">Wróć do trybów</Link>
          </div>
        </section>
      ) : (
        <>
          <header className="quiz-heading">
            <span className="eyebrow">{category.title.toLocaleUpperCase('pl-PL')} · {area.name.toLocaleUpperCase('pl-PL')}</span>
            <h1>Rozpoznaj flagę</h1>
            <p>Wyświetlamy flagę państwa. Wpisz jego nazwę po polsku.</p>
          </header>

          <section className="quiz-stats" aria-label="Postęp quizu">
            <div className="quiz-stat"><Flag size={19} /><span><strong>{foundIds.length}/{baseQuizItems.length}</strong><small>Poprawne odpowiedzi</small></span></div>
            <div className="quiz-stat"><Clock3 size={19} /><span><strong>{formatTime(elapsedSeconds)}</strong><small>Czas</small></span></div>
            <div className="quiz-stat"><Trophy size={19} /><span><strong>{Math.round(foundIds.length / baseQuizItems.length * 100)}%</strong><small>Ukończenie quizu</small></span></div>
          </section>

          <section className="capital-quiz-card flag-quiz-card">
            <div className="map-header"><h2>Do jakiego państwa należy ta flaga?</h2><span>Poprawnie: {foundIds.length} z {baseQuizItems.length}</span></div>
            <div className="flag-prompt">
              <span className="eyebrow">FLAGA PAŃSTWA</span>
              {current ? <img src={current.imageUrl} alt="Flaga państwa do rozpoznania" /> : <p>Brak flag w kolejce</p>}
            </div>
            <div className="quiz-answer-card">
              <p>Wpisz nazwę państwa. Wielkość liter i polskie znaki nie mają znaczenia.</p>
              <form onSubmit={submitAnswer}>
                <label htmlFor="flag-country-answer">Nazwa państwa</label>
                <input id="flag-country-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Np. Polska" autoComplete="off" disabled={isEnded} />
                <button className="primary-button country-submit" type="submit" disabled={!answer.trim()}>Sprawdź odpowiedź</button>
              </form>
              <div className={`quiz-feedback ${feedback?.type ?? 'info'}`} aria-live="polite">
                {feedback?.type === 'success' ? <CheckCircle2 size={17} /> : feedback?.type === 'error' ? <XCircle size={17} /> : null}
                <span>{feedback?.text ?? 'Wpisz nazwę państwa i naciśnij Enter lub przycisk.'}</span>
              </div>
              <div className="quiz-progress-track"><span style={{ width: `${foundIds.length / baseQuizItems.length * 100}%` }} /></div>
              <button type="button" className="secondary-button quiz-end-button" onClick={skipCurrent}>Pomiń — wróć do niego później</button>
              <button type="button" className="secondary-button quiz-end-button" onClick={() => saveResult('ended-early')}>Zakończ quiz</button>
              <p className="quiz-result-note">Pominięte flagi wracają na koniec kolejki. Quiz kończy się po poprawnym rozpoznaniu wszystkich flag lub po wybraniu „Zakończ quiz”.</p>
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default TypeFlagPage
