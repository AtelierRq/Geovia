import { useEffect, useState } from 'react'
import { Activity, ArrowLeft, CalendarDays, CheckCircle2, Clock3, MapPin, Trophy, UserRound } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getPublicProfile, getPublicProfileActivity, type PublicProfile, type PublicProfileActivity } from '../api/profile'
import { formatPercentage } from '../utils/formatPercentage'
import '../styles/profile.css'

const CATEGORY_NAMES: Record<string, string> = {
  countries: 'Państwa', capitals: 'Stolice', flags: 'Flagi', cities: 'Miasta', seas: 'Morza',
  rivers: 'Rzeki', islands: 'Wyspy', 'dependent-territories': 'Terytoria zależne',
  'unrecognized-states': 'Państwa nieuznawane',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function PublicProfilePage() {
  const { username = '' } = useParams()
  const location = useLocation()
  const fromFriends = (location.state as { from?: string } | null)?.from === '/profile/friends'
  const backTo = fromFriends ? '/profile/friends' : '/profile'
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [activity, setActivity] = useState<PublicProfileActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [activityError, setActivityError] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true); setProfile(null); setActivity(null); setError(''); setActivityError('')
    getPublicProfile(username)
      .then(value => { if (active) setProfile(value) })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Nie udało się pobrać profilu.') })
      .finally(() => { if (active) setLoading(false) })
    getPublicProfileActivity(username)
      .then(value => { if (active) setActivity(value) })
      .catch(reason => { if (active) setActivityError(reason instanceof Error ? reason.message : 'Nie udało się pobrać statystyk.') })
    return () => { active = false }
  }, [username])

  return <main className="profile-page public-profile-page">
    <div className="account-back-row"><Link to={backTo}><ArrowLeft size={17} /> {fromFriends ? 'Wróć do znajomych' : 'Wróć do profilu'}</Link></div>
    {loading ? <p className="profile-section-caption">Pobieranie profilu…</p> : profile ? <>
      <section className="profile-heading"><div><span className="eyebrow">PROFIL PUBLICZNY</span><h1>{profile.username}</h1><p>Profil udostępniony w Geovii.</p></div></section>
      <section className="profile-user-card public-profile-card">
        <div className="profile-avatar public-profile-avatar">{profile.avatarUrl ? <img src={profile.avatarUrl} alt={`Avatar użytkownika ${profile.username}`} /> : <UserRound size={38} />}</div>
        <div className="profile-user-info"><h2>{profile.username}</h2>{profile.city && <p className="public-profile-city"><MapPin size={15} /> {profile.city}</p>}{profile.bio && <p className="profile-bio-preview">{profile.bio}</p>}</div>
      </section>

      <section className="public-activity-section">
        <div className="profile-section-heading"><div><span className="eyebrow">PODSUMOWANIE</span><h2>Aktywność</h2></div></div>
        {activityError && <p className="form-error" role="status">Nie udało się pobrać statystyk aktywności.</p>}
        {activity && <>
          <p className="profile-section-caption">Na podstawie zapisanych wyników</p>
          <div className="public-activity-grid">
            <article className="profile-stat-card"><div className="profile-stat-icon"><Trophy size={19} /></div><span>Quizy łącznie</span><strong>{activity.totalAttempts}</strong><small>od początku korzystania</small></article>
            <article className="profile-stat-card"><div className="profile-stat-icon"><CalendarDays size={19} /></div><span>Ostatnie 30 dni</span><strong>{activity.attemptsLast30Days}</strong><small>rozegrane quizy</small></article>
            <article className="profile-stat-card"><div className="profile-stat-icon"><CheckCircle2 size={19} /></div><span>Poprawne odpowiedzi</span><strong>{activity.totalCorrectAnswers}</strong><small>suma zaliczonych elementów</small></article>
            <article className="profile-stat-card"><div className="profile-stat-icon"><Activity size={19} /></div><span>Średni wynik</span><strong>{formatPercentage(activity.averageScorePercent)}</strong><small>średnia z zapisanych quizów</small></article>
          </div>
          <div className="profile-last-activity public-last-activity"><Clock3 size={18} /><div><strong>Ostatnia aktywność</strong><span>{activity.lastAttemptAt ? `${formatDate(activity.lastAttemptAt)} · ${CATEGORY_NAMES[activity.lastCategoryId ?? ''] ?? activity.lastCategoryId ?? 'Quiz'}` : 'Brak zapisanych rozgrywek'}</span></div>{activity.lastScorePercent !== null && <strong className="profile-last-score">{Number(activity.lastScorePercent).toLocaleString('pl-PL', { maximumFractionDigits: 2 })}%</strong>}</div>
        </>}
      </section>
    </> : <section className="profile-empty-state public-profile-empty"><UserRound size={30} /><h2>Profil niedostępny</h2><p>{error || 'Ten profil nie istnieje lub jest prywatny.'}</p><Link className="primary-button" to={backTo}>{fromFriends ? 'Wróć do znajomych' : 'Wróć do profilu'}</Link></section>}
  </main>
}
export default PublicProfilePage
