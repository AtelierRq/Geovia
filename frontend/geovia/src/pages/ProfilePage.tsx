import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  MapPinned,
  Plus,
  Minus,
  Settings,
  Trophy,
  Users,
  UserRound,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import worldData from "world-atlas/countries-50m.json";
import { useUser } from "../context/UserContext";
import { countries } from "../data/countries";
import { getCapitalForCountry } from "../data/capitals";
import { getCountryFlag } from "../data/countryFlags";
import { calculateCountryKnowledge, getCountryKnowledgeStatusLabel, type CountryMapStatus, type KnowledgeStatus } from "../utils/countryKnowledge";
import "../styles/profile.css";

type KnowledgeElementKey = "name" | "capital" | "flag";

// Dodatkowe geometrie przypisane do państwa nadrzędnego na mapie świata.
const MAP_ID_ALIASES: Record<string, string> = {
  "304": "denmark", // Grenlandia -> Dania
  "732": "morocco", // Sahara Zachodnia -> Maroko
};

const kosovoFeature = {
  type: "Feature",
  id: "383",
  properties: { name: "Kosowo" },
  geometry: {
    type: "Polygon",
    coordinates: [[
      [20.76216, 42.05186], [20.71731, 41.84711], [20.59023, 41.85541],
      [20.52295, 42.21787], [20.28374, 42.32025], [20.0707, 42.58863],
      [20.25758, 42.81275], [20.49679, 42.88469], [20.63508, 43.21671],
      [20.81448, 43.27205], [20.95651, 43.13094], [21.143395, 43.068685],
      [21.27421, 42.90959], [21.43866, 42.86255], [21.63302, 42.67717],
      [21.77505, 42.6827], [21.66292, 42.43922], [21.54332, 42.32025],
      [21.576636, 42.245224], [21.3527, 42.2068], [20.76216, 42.05186],
    ]],
  },
} as any;

type QuizResult = {
  id: string;
  categoryId: string;
  areaId: string;
  modeId: string;
  completed: number;
  total: number;
  percentage: number;
  elapsedSeconds: number;
  endedAt: string;
  status: "completed" | "ended-early";
  foundCountries?: string[];
};

const CATEGORY_NAMES: Record<string, string> = {
  countries: "Państwa",
  capitals: "Stolice",
  flags: "Flagi",
  cities: "Miasta",
  seas: "Morza",
  rivers: "Rzeki",
  islands: "Wyspy",
  "dependent-territories": "Terytoria zależne",
  "unrecognized-states": "Państwa nieuznawane",
};

const AREA_NAMES: Record<string, string> = {
  world: "Cały świat",
  europe: "Europa",
  africa: "Afryka",
  asia: "Azja",
  "north-america": "Ameryka Północna",
  "south-america": "Ameryka Południowa",
  oceania: "Oceania",
};

const MODE_NAMES: Record<string, string> = {
  "type-to-map": "Wpisz państwo",
  "type-capital": "Wpisz stolicę",
};

function readResults(): QuizResult[] {
  try {
    const value = JSON.parse(
      localStorage.getItem("geovia.quizResults") ?? "[]",
    );
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("pl-PL", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function ProfilePage() {
  const { user } = useUser();
  const results = useMemo(
    () =>
      readResults().sort(
        (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
      ),
    [],
  );
  if (!user) return <Navigate to="/login" replace />;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentResults = results.filter(
    (result) => new Date(result.endedAt).getTime() >= thirtyDaysAgo,
  );
  const correctAnswers = results.reduce(
    (sum, result) => sum + (Number(result.completed) || 0),
    0,
  );
  const averageScore = results.length
    ? Math.round(
        results.reduce(
          (sum, result) => sum + (Number(result.percentage) || 0),
          0,
        ) / results.length,
      )
    : 0;
  const lastResult = results[0];
  const countryKnowledge = useMemo(() => calculateCountryKnowledge(results), [results]);
  const knowledgeCounts = countryKnowledge.reduce(
    (counts, item) => { counts[item.overall] += 1; return counts; },
    { unknown: 0, "needs-work": 0, learning: 0, mastered: 0 } as Record<CountryMapStatus, number>,
  );
  const countryById = new Map(countries.map((country) => [country.id, country]));
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10, 15]);
  const mapFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mapFrame = mapFrameRef.current;
    if (!mapFrame) return;

    // A native, non-passive listener is required so preventDefault() still
    // blocks page scrolling when the map reaches either zoom limit.
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setMapZoom((current) =>
        Math.min(20, Math.max(1, current * (event.deltaY < 0 ? 1.2 : 1 / 1.2))),
      );
    };

    mapFrame.addEventListener("wheel", handleWheel, { passive: false });
    return () => mapFrame.removeEventListener("wheel", handleWheel);
  }, []);
  const selectedKnowledge = selectedCountryId
    ? countryKnowledge.find((item) => item.countryId === selectedCountryId)
    : undefined;
  const selectedCountry = selectedCountryId ? countryById.get(selectedCountryId) : undefined;
  const mapFill = (status: CountryMapStatus) => ({
    mastered: "#39966b",
    learning: "#e9a23b",
    "needs-work": "#d9655b",
    unknown: "#d8dad5",
  })[status];
  const statusClass = (status: KnowledgeStatus | CountryMapStatus) => `knowledge-status knowledge-status--${status}`;
  return (
    <main className="profile-page">
      <section className="profile-heading">
        <div>
          <span className="eyebrow">TWOJA PRZESTRZEŃ</span>
          <h1>Twój profil</h1>
          <p>Śledź postępy i rozwijaj swoją wiedzę geograficzną.</p>
        </div>
        <Link
          className="secondary-button profile-settings-link"
          to="/profile/account"
        >
          <Settings size={17} /> Ustawienia konta
        </Link>
      </section>
      <div className="profile-overview-grid">
        <section className="profile-user-card">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt="Zdjęcie profilowe" />
          ) : (
            <UserRound size={34} />
          )}
        </div>
        <div className="profile-user-info">
          <h2>{user.username}</h2>
          {user.city && <p>{user.city}</p>}
          {user.bio && <p className="profile-bio-preview">{user.bio}</p>}
          <span className="profile-local-note">
            Profil użytkownika
          </span>
        </div>
        <Link to="/profile/edit" className="profile-edit-link">
          Edytuj profil <ArrowRight size={16} />
        </Link>
      </section>
      <section className="profile-section">
        <div className="profile-section-heading">
          <div>
            <span className="eyebrow">PODSUMOWANIE</span>
            <h2>Twoja aktywność</h2>
          </div>
          <span className="profile-section-caption">
            Na podstawie zapisanych wyników
          </span>
        </div>
        <div className="profile-stat-grid">
          <article className="profile-stat-card">
            <div className="profile-stat-icon">
              <Trophy size={20} />
            </div>
            <span>Quizy łącznie</span>
            <strong>{results.length}</strong>
            <small>od początku korzystania</small>
          </article>
          <article className="profile-stat-card">
            <div className="profile-stat-icon">
              <CalendarDays size={20} />
            </div>
            <span>Ostatnie 30 dni</span>
            <strong>{recentResults.length}</strong>
            <small>rozegrane quizy</small>
          </article>
          <article className="profile-stat-card">
            <div className="profile-stat-icon">
              <CheckCircle2 size={20} />
            </div>
            <span>Poprawne odpowiedzi</span>
            <strong>{correctAnswers}</strong>
            <small>suma zaliczonych elementów</small>
          </article>
          <article className="profile-stat-card">
            <div className="profile-stat-icon">
              <Activity size={20} />
            </div>
            <span>Średni wynik</span>
            <strong>{averageScore}%</strong>
            <small>średnia z zapisanych quizów</small>
          </article>
        </div>
        <div className="profile-last-activity">
          <Clock3 size={18} />
          <div>
            <strong>Ostatnia aktywność</strong>
            <span>
              {lastResult
                ? `${formatDate(lastResult.endedAt)} · ${CATEGORY_NAMES[lastResult.categoryId] ?? lastResult.categoryId}`
                : "Brak zapisanych rozgrywek"}
            </span>
          </div>
          {lastResult && (
            <span className="profile-last-score">{lastResult.percentage}%</span>
          )}
        </div>
      </section>
      </div>
      <section className="profile-section">
        <div className="profile-section-heading">
          <div>
            <span className="eyebrow">POSTĘPY</span>
            <h2>Znajomość państw</h2>
          </div>
        </div>
        <div className="profile-feature-card knowledge-feature">
          <div className="feature-icon"><MapPinned size={25} /></div>
          <div className="profile-feature-copy">
            <h3>Twoja mapa wiedzy</h3>
            <p>Wstępne podsumowanie znajomości państw na podstawie zapisanych quizów. Każdy element (nazwa, stolica, flaga) oceniany jest osobno.</p>
          </div>
          <div className="knowledge-map-content">
            <div className="knowledge-status-summary">
              {([['mastered', 'Opanowane'], ['learning', 'W trakcie nauki'], ['needs-work', 'Do nauki'], ['unknown', 'Brak danych']] as [CountryMapStatus, string][]).map(([status, label]) => (
                <div className="knowledge-summary-item" key={status}>
                  <span className={statusClass(status)} />
                  <span>{label}</span>
                  <strong>{knowledgeCounts[status]}</strong>
                </div>
              ))}
            </div>
            <div className="knowledge-map-layout">
              <div
                ref={mapFrameRef}
                className="knowledge-map-frame"
                aria-label="Interaktywna mapa znajomości państw. Wybierz państwo, aby zobaczyć szczegóły."
              >
                <div className="knowledge-map-zoom-controls" aria-label="Sterowanie powiększeniem mapy">
                  <button type="button" aria-label="Powiększ mapę" onClick={() => setMapZoom((current) => Math.min(20, current * 1.25))}>
                    <Plus size={17} />
                  </button>
                  <button type="button" aria-label="Pomniejsz mapę" onClick={() => setMapZoom((current) => Math.max(1, current / 1.25))}>
                    <Minus size={17} />
                  </button>
                </div>
                <ComposableMap
                  width={900}
                  height={480}
                  projection="geoMercator"
                  projectionConfig={{ scale: 145, center: [10, 15] }}
                  className="knowledge-world-map"
                >
                  <ZoomableGroup
                    center={mapCenter}
                    zoom={mapZoom}
                    minZoom={1}
                    maxZoom={20}
                    onMoveEnd={({ coordinates, zoom }) => {
                      if (Array.isArray(coordinates)) {
                        setMapCenter(coordinates as [number, number]);
                      }
                      if (typeof zoom === "number") setMapZoom(zoom);
                    }}
                  >
                    <Geographies geography={worldData as unknown as string}>
                      {({ geographies }) => geographies.map((geo) => {
                        const mapId = String(geo.id).replace(/^0+/, "");
                        const country = countries.find((item) => item.mapId.replace(/^0+/, "") === mapId || item.id === MAP_ID_ALIASES[mapId]);
                        if (!country) return (
                          <Geography key={geo.rsmKey} geography={geo} fill="#e8e8e2" stroke="#fffdf8" strokeWidth={0.45} style={{ outline: "none" }} />
                        );
                        const knowledge = countryKnowledge.find((item) => item.countryId === country.id);
                        const selected = selectedCountryId === country.id;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onClick={() => setSelectedCountryId(country.id)}
                            fill={mapFill(knowledge?.overall ?? "unknown")}
                            stroke="#171a18"
                            strokeWidth={Math.max(0.12, 0.65 / Math.pow(mapZoom, 0.62))}
                            style={{ outline: "none", cursor: "pointer", transition: "fill 120ms ease" }}
                            aria-label={country.name}
                          />
                        );
                      })}
                    </Geographies>
                    <Geographies geography={{ type: "FeatureCollection", features: [kosovoFeature] } as any}>
                      {({ geographies }) => geographies.map((geo) => {
                        const knowledge = countryKnowledge.find((item) => item.countryId === "kosovo");
                        const selected = selectedCountryId === "kosovo";
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onClick={() => setSelectedCountryId("kosovo")}
                            fill={mapFill(knowledge?.overall ?? "unknown")}
                            stroke="#171a18"
                            strokeWidth={Math.max(0.12, 0.65 / Math.pow(mapZoom, 0.62))}
                            style={{ outline: "none", cursor: "pointer", transition: "fill 120ms ease" }}
                            aria-label="Kosowo"
                          />
                        );
                      })}
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              </div>
              <div className="knowledge-map-details">
                {selectedCountry && selectedKnowledge ? (
                  <>
                    <div className="knowledge-selected-heading">
                      <span className={statusClass(selectedKnowledge.overall)} />
                      <div className="knowledge-selected-title">
                        <h3>{selectedCountry.name}</h3>
                        <span>{getCountryKnowledgeStatusLabel(selectedKnowledge.overall)}</span>
                      </div>
                    </div>
                    <div className="knowledge-country-facts">
                      <div className="knowledge-country-fact">
                        <span className="knowledge-country-fact-label">Stolica</span>
                        <strong>{getCapitalForCountry(selectedCountry.id)?.name ?? "Brak danych"}</strong>
                      </div>
                      <div className="knowledge-country-fact knowledge-country-flag-fact">
                        <span className="knowledge-country-fact-label">Flaga</span>
                        <div className="knowledge-country-flag-slot">
                          {getCountryFlag(selectedCountry.id) ? (
                            <span className="knowledge-country-flag-frame">
                              <img
                                className="knowledge-country-flag"
                                src={getCountryFlag(selectedCountry.id)!.imageUrl}
                                alt={`Flaga państwa ${selectedCountry.name}`}
                                loading="lazy"
                              />
                            </span>
                          ) : (
                            <span>Brak grafiki flagi</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="knowledge-element-list">
                      {([['name', 'Nazwa'], ['capital', 'Stolica'], ['flag', 'Flaga']] as [KnowledgeElementKey, string][]).map(([key, label]) => (
                        <div className="knowledge-element-row" key={key}>
                          <span>{label}</span>
                          <span className="knowledge-element-status"><span className={statusClass(selectedKnowledge[key])} />{getCountryKnowledgeStatusLabel(selectedKnowledge[key])}</span>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="knowledge-clear-selection" onClick={() => setSelectedCountryId(null)}>Wyczyść wybór</button>
                  </>
                ) : (
                  <div className="knowledge-map-prompt">
                    <MapPinned size={25} />
                    <strong>Wybierz państwo</strong>
                    <p>Kliknij państwo na mapie, aby sprawdzić status nazwy, stolicy i flagi.</p>
                  </div>
                )}
              </div>
            </div>
            <small>Kliknij państwo na mapie, aby zobaczyć szczegółowe statusy. Flagi pozostają szare, dopóki nie będzie quizu z flagami.</small>
          </div>
        </div>
      </section>
      <section className="profile-section">
        <div className="profile-section-heading">
          <div>
            <span className="eyebrow">HISTORIA</span>
            <h2>Ostatnie quizy</h2>
          </div>
          <span className="profile-section-caption">
            {results.length} zapisanych rozgrywek
          </span>
        </div>
        {results.length ? (
          <div className="profile-history-list">
            {results.slice(0, 8).map((result) => (
              <article className="profile-history-row" key={result.id}>
                <div className="history-type-icon">
                  <History size={19} />
                </div>
                <div className="history-main">
                  <strong>
                    {CATEGORY_NAMES[result.categoryId] ?? result.categoryId} ·{" "}
                    {MODE_NAMES[result.modeId] ?? result.modeId}
                  </strong>
                  <span>
                    {AREA_NAMES[result.areaId] ?? result.areaId} ·{" "}
                    {formatDate(result.endedAt)}
                  </span>
                </div>
                <div className="history-result">
                  <strong>
                    {result.completed}/{result.total}
                  </strong>
                  <span>{result.percentage}%</span>
                </div>
                <div className="history-time">
                  {formatDuration(result.elapsedSeconds)}
                </div>
                <span
                  className={`history-status ${result.status === "completed" ? "is-completed" : ""}`}
                >
                  {result.status === "completed"
                    ? "Ukończony"
                    : "Zakończony wcześniej"}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="profile-empty-state">
            <History size={28} />
            <h3>Twoja historia dopiero się zaczyna</h3>
            <p>Po rozegraniu quizu jego wynik pojawi się tutaj.</p>
            <Link to="/quizzes" className="primary-button">
              Przejdź do quizów <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
      <section className="profile-section friends-section">
        <div className="profile-section-heading">
          <div>
            <span className="eyebrow">SPOŁECZNOŚĆ</span>
            <h2>Znajomi</h2>
          </div>
          <span className="profile-section-caption">W przygotowaniu</span>
        </div>
        <div className="profile-feature-card friends-feature">
          <div className="feature-icon">
            <Users size={25} />
          </div>
          <div className="profile-feature-copy">
            <h3>Ucz się razem ze znajomymi</h3>
            <p>
              Lista znajomych i wspólne porównywanie postępów pojawią się w
              późniejszym etapie rozwoju Geovii.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
export default ProfilePage;
