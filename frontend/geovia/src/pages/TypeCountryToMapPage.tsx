import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Clock3, Flag, Minus, Plus, Trophy, XCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import geoviaWorldCountries from '../data/map/geoviaWorldCountries.json'
import geoviaWorldBorders from '../data/map/geoviaWorldBorders.json'
import { categories } from '../data/categories'
import { areas } from '../data/areas'
import { getCountriesByContinent, countries, normalizeCountryName } from '../data/countries'
import '../styles/quiz-common.css'
import '../styles/country-quiz.css'

type SavedQuizResult = {
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

// Dodatkowe geometrie, które w quizie zaliczamy razem z państwem nadrzędnym.
const MAP_ID_ALIASES: Record<string, string> = {
  '304': 'denmark', // Grenlandia -> Dania
  '732': 'morocco', // Sahara Zachodnia -> Maroko
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function TypeCountryToMapPage() {
  const { categoryId: routeCategoryId, areaId: routeAreaId, modeId: routeModeId } = useParams()
  const categoryId = routeCategoryId ?? 'countries'
  const areaId = routeAreaId ?? 'europe'
  const modeId = routeModeId ?? 'type-to-map'
  const quizCountries = areaId === 'world' ? countries : getCountriesByContinent(areaId as any)
  const isWorldMap = areaId === 'world'
  const mapCenter: [number, number] = isWorldMap ? [0, 15] : [20, 54]
  const projectionScale = isWorldMap ? 155 : 520
  const category = categories.find((item) => item.id === categoryId)
  const area = areas.find((item) => item.id === areaId)
  const [answer, setAnswer] = useState('')
  const [foundIds, setFoundIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [endedResult, setEndedResult] = useState<SavedQuizResult | null>(null)
  const [mapZoom, setMapZoom] = useState(1)
  const [mapCenterState, setMapCenterState] = useState<[number, number]>(isWorldMap ? [0, 15] : [20, 54])

  const foundSet = useMemo(() => new Set(foundIds), [foundIds])
  const elapsedSeconds = startedAt === null ? 0 : Math.floor((now - startedAt) / 1000)
  const isCompleted = foundIds.length === quizCountries.length
  const isEnded = endedResult !== null

  useEffect(() => {
    if (startedAt === null || isEnded) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [startedAt, isEnded])

  function saveResult(status: SavedQuizResult['status']) {
    if (endedResult) return
    const result: SavedQuizResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      categoryId: categoryId ?? 'countries',
      areaId: areaId ?? 'europe',
      modeId: modeId ?? 'type-to-map',
      completed: foundIds.length,
      total: quizCountries.length,
      percentage: Math.round((foundIds.length / quizCountries.length) * 100),
      elapsedSeconds,
      endedAt: new Date().toISOString(),
      status,
      foundCountries: foundIds,
    }
    try {
      const previous = JSON.parse(localStorage.getItem(RESULTS_KEY) ?? '[]') as SavedQuizResult[]
      localStorage.setItem(RESULTS_KEY, JSON.stringify([...previous, result]))
    } catch {
      // Quiz result remains visible for this session even if local storage is unavailable.
    }
    setEndedResult(result)
  }

  useEffect(() => {
    if (isCompleted && !endedResult) saveResult('completed')
  }, [isCompleted, endedResult])

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isEnded) return
    const normalizedAnswer = normalizeCountryName(answer)
    if (!normalizedAnswer) return

    const country = quizCountries.find((item) =>
      [item.name, ...(item.aliases ?? [])].some((name) => normalizeCountryName(name) === normalizedAnswer),
    )

    if (!country) {
      setFeedback({ type: 'error', text: 'Nie rozpoznaję tej nazwy. Spróbuj ponownie.' })
      return
    }
    if (foundSet.has(country.id)) {
      setFeedback({ type: 'info', text: `Państwo „${country.name}” zostało już zaliczone.` })
      setAnswer('')
      return
    }

    setFoundIds((current) => [...current, country.id])
    setFeedback({ type: 'success', text: `Dobrze! Zaznaczono państwo: ${country.name}.` })
    setAnswer('')
  }

  if (!category || !area || categoryId !== 'countries' || !['world', 'africa', 'asia', 'europe', 'north-america', 'south-america', 'oceania'].includes(areaId) || modeId !== 'type-to-map') {
    return (
      <main className="catalog-page">
        <section className="catalog-heading">
          <h1>Ten quiz nie jest dostępny</h1>
          <p>Ten tryb nie jest dostępny dla wybranego obszaru.</p>
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
          <h1>{endedResult.status === 'completed' ? 'Gratulacje! Uzupełniono mapę.' : 'Wynik quizu'}</h1>
          <div className="quiz-result-score">{endedResult.completed}/{endedResult.total}</div>
          <p>Odnalezione państwa: <strong>{endedResult.percentage}%</strong></p>
          <p>Czas: <strong>{formatTime(endedResult.elapsedSeconds)}</strong></p>
          <p className="quiz-result-note">Wynik został zapisany w tej przeglądarce. Po zakończeniu nie można kontynuować tej próby.</p>
          <div className="quiz-result-actions">
            <button type="button" className="primary-button" onClick={() => window.location.assign(`/quiz/${category.id}/${area.id}/type-to-map`)}>Rozpocznij nowy quiz</button>
            <Link to={`/categories/${category.id}/areas/${area.id}/modes`} className="secondary-button">Wróć do trybów</Link>
          </div>
        </section>
      ) : (
        <>
          <header className="quiz-heading">
            <span className="eyebrow">{category.title.toLocaleUpperCase('pl-PL')} · {area.name.toLocaleUpperCase('pl-PL')}</span>
            <h1>Wpisz państwo</h1>
            <p>Wpisz nazwę dowolnego państwa. Poprawna odpowiedź zostanie zaznaczona na mapie.</p>
          </header>

          <section className="quiz-stats" aria-label="Postęp quizu">
            <div className="quiz-stat"><Flag size={19} /><span><strong>{foundIds.length}/{quizCountries.length}</strong><small>Znalezione państwa</small></span></div>
            <div className="quiz-stat"><Clock3 size={19} /><span><strong>{formatTime(elapsedSeconds)}</strong><small>Czas</small></span></div>
            <div className="quiz-stat"><Trophy size={19} /><span><strong>{Math.round(foundIds.length / quizCountries.length * 100)}%</strong><small>Ukończenie mapy</small></span></div>
          </section>

          <section className="country-quiz-layout">
            <div className="map-card">
              <div className="map-header"><h2>{isWorldMap ? 'Mapa świata' : `Mapa: ${area.name}`}</h2><span>{foundIds.length} z {quizCountries.length}</span></div>
              <div
                className="map-wrap"
                onWheel={(event) => {
                  event.preventDefault()
                  setMapZoom((current) => Math.min(20, Math.max(1, current * (event.deltaY < 0 ? 1.2 : 1 / 1.2))))
                }}
              >
                <div className="map-zoom-controls" aria-label="Sterowanie powiększeniem mapy">
                  <button type="button" aria-label="Powiększ mapę" onClick={() => setMapZoom((current) => Math.min(20, current * 1.25))}>
                    <Plus size={16} />
                  </button>
                  <button type="button" aria-label="Pomniejsz mapę" onClick={() => setMapZoom((current) => Math.max(1, current / 1.25))}>
                    <Minus size={16} />
                  </button>
                </div>
                <ComposableMap projection="geoMercator" projectionConfig={{ center: mapCenter, scale: projectionScale }} width={800} height={560}>
                  <ZoomableGroup
                    center={mapCenterState}
                    zoom={mapZoom}
                    minZoom={1}
                    maxZoom={20}
                    onMoveEnd={({ coordinates, zoom }) => {
                      setMapCenterState(coordinates as [number, number])
                      if (typeof zoom === 'number') {
                        setMapZoom(zoom)
                      }
                    }}
                  >
                    <Geographies geography={geoviaWorldCountries as any}>
                      {({ geographies }) => (
                        <>
                          {geographies.map((geo) => {
                            const mapId = String(geo.id).replace(/^0+/, '')
                            const country = quizCountries.find((item) => item.mapId.replace(/^0+/, '') === mapId || item.id === MAP_ID_ALIASES[mapId])
                            const isFound = country ? foundSet.has(country.id) : false
                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={isFound ? '#68a889' : '#e7e9e2'}
                                stroke="none"
                                strokeWidth={0}
                                style={{ outline: 'none', pointerEvents: 'none' }}
                                className="map-country"
                              />
                            )
                          })}
                        </>
                      )}
                    </Geographies>
                    <Geographies geography={geoviaWorldBorders as any}>
                      {({ geographies }) => geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="none"
                          stroke="#9daaa1"
                          strokeWidth={Math.max(0.12, 0.65 / Math.pow(mapZoom, 0.62))}
                          style={{ outline: 'none', pointerEvents: 'none' }}
                        />
                      ))}
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              </div>
              <div className="map-legend"><span><i className="legend-swatch legend-found" /> Odnalezione</span><span><i className="legend-swatch legend-unfound" /> Do odnalezienia</span></div>
            </div>

            <aside className="quiz-answer-card">
              <h2>Jakie państwo znasz?</h2>
              <p>Wpisuj nazwy po polsku. Wielkość liter i polskie znaki nie mają znaczenia.</p>
              <form onSubmit={submitAnswer}>
                <label htmlFor="country-answer">Nazwa państwa</label>
                <input
                  id="country-answer"
                  type="text"
                  autoComplete="off"
                  placeholder="Np. Polska"
                  value={answer}
                  disabled={isEnded}
                  onChange={(event) => {
                    setAnswer(event.target.value)
                    if (event.target.value.length > 0 && startedAt === null) {
                      setStartedAt(Date.now())
                      setNow(Date.now())
                    }
                  }}
                />
                <button className="primary-button country-submit" type="submit" disabled={!answer.trim()}>Sprawdź odpowiedź</button>
              </form>
              <div className={`quiz-feedback ${feedback ? `feedback-${feedback.type}` : ''}`} aria-live="polite">
                {feedback ? <>{feedback.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}<span>{feedback.text}</span></> : <span>Wpisz nazwę i naciśnij Enter lub przycisk.</span>}
              </div>
              <div className="quiz-progress-track"><span style={{ width: `${foundIds.length / quizCountries.length * 100}%` }} /></div>
              <button className="secondary-button quiz-end-button" type="button" onClick={() => saveResult(isCompleted ? 'completed' : 'ended-early')}>
                Zakończ quiz
              </button>
              <p className="quiz-end-hint">Zakończona próba zostanie zapisana i nie będzie można jej wznowić.</p>
            </aside>
          </section>
          {isCompleted && (
            <div className="quiz-complete-banner">
              <Trophy size={21} /><span><strong>Udało się!</strong> Odnaleziono wszystkie państwa.</span>
              <button type="button" className="primary-button" onClick={() => saveResult('completed')}>Zapisz wynik</button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default TypeCountryToMapPage
