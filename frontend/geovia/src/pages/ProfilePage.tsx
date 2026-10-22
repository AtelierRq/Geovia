import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  MapPinned,
  Settings,
  Trophy,
  Users,
  UserRound,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/profile.css";

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
  const uniqueCountries = new Set(
    results.flatMap((result) => result.foundCountries ?? []),
  ).size;
  const lastResult = results[0];
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
          <div className="feature-icon">
            <MapPinned size={25} />
          </div>
          <div className="profile-feature-copy">
            <h3>Twoja mapa wiedzy</h3>
            <p>
              Widzisz już {uniqueCountries} różnych państw zaliczonych w
              zapisanych quizach. W kolejnym etapie rozbudujemy tę sekcję o mapę
              oraz statusy „do nauki”, „w trakcie nauki” i „opanowane”.
            </p>
            <div className="knowledge-progress">
              <span
                style={{
                  width: `${Math.min(100, (uniqueCountries / 197) * 100)}%`,
                }}
              />
            </div>
            <small>
              {uniqueCountries} z 197 państw rozpoznanych w historii quizów — to
              jeszcze nie jest ocena poziomu opanowania.
            </small>
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
