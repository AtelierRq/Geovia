import { useEffect, useState } from 'react'
import { MapPin, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getPublicProfile, type PublicProfile } from '../api/profile'
import '../styles/profile.css'

function PublicProfilePage() {
  const { username = '' } = useParams()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true); setProfile(null); setError('')
    getPublicProfile(username)
      .then(value => { if (active) setProfile(value) })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Nie udało się pobrać profilu.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [username])

  return <main className="profile-page public-profile-page">
    {loading ? <p className="profile-section-caption">Pobieranie profilu…</p> : profile ? <>
      <section className="profile-heading"><div><span className="eyebrow">PROFIL PUBLICZNY</span><h1>{profile.username}</h1><p>Profil udostępniony w Geovii.</p></div></section>
      <section className="profile-user-card public-profile-card">
        <div className="profile-avatar public-profile-avatar">{profile.avatarUrl ? <img src={profile.avatarUrl} alt={`Avatar użytkownika ${profile.username}`} /> : <UserRound size={38} />}</div>
        <div className="profile-user-info"><h2>{profile.username}</h2>{profile.city && <p className="public-profile-city"><MapPin size={15} /> {profile.city}</p>}{profile.bio && <p className="profile-bio-preview">{profile.bio}</p>}</div>
      </section>
    </> : <section className="profile-empty-state public-profile-empty"><UserRound size={30} /><h2>Profil niedostępny</h2><p>{error || 'Ten profil nie istnieje lub jest prywatny.'}</p><Link className="primary-button" to="/">Wróć na stronę główną</Link></section>}
  </main>
}
export default PublicProfilePage
