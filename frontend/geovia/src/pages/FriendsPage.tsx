import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, Search, UserMinus, UserPlus, UserRound, Users, X } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { acceptFriendRequest, cancelFriendRequest, declineFriendRequest, getFriends, removeFriend, searchFriends, sendFriendRequest, type FriendOverview, type FriendSearchResult } from '../api/profile'
import { useUser } from '../context/UserContext'
import '../styles/profile.css'

function FriendAvatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  return <span className="friend-avatar">{avatarUrl ? <img src={avatarUrl} alt="" /> : <UserRound size={22} aria-hidden="true" />}<span className="visually-hidden">{username}</span></span>
}

function FriendsPage() {
  const { user, profileLoading } = useUser()
  const [overview, setOverview] = useState<FriendOverview>({ friends: [], incomingRequests: [], outgoingRequests: [] })
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    const result = await getFriends()
    setOverview(result)
  }, [])

  useEffect(() => {
    if (!user) return
    refresh().catch(reason => setError(reason instanceof Error ? reason.message : 'Nie udało się pobrać listy znajomych.'))
      .finally(() => setLoading(false))
  }, [user, refresh])

  if (!profileLoading && !user) return <Navigate to="/login" replace />

  async function run(action: () => Promise<unknown>, successMessage = ''): Promise<boolean> {
    setBusy(true); setError(''); setMessage('')
    try {
      await action()
      await refresh()
      if (successMessage) setMessage(successMessage)
      return true
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Nie udało się wykonać tej czynności.')
      return false
    } finally { setBusy(false) }
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('')
    if (query.trim().length < 2) { setSearchResults([]); setSearched(false); return }
    setBusy(true)
    try { setSearchResults(await searchFriends(query.trim())); setSearched(true) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Nie udało się wyszukać użytkowników.') }
    finally { setBusy(false) }
  }

  async function addSearchResult(item: FriendSearchResult) {
    if (await run(() => sendFriendRequest(item.username), 'Wysłano zaproszenie do znajomych.')) {
      setSearchResults(current => current.map(result => result.profileId === item.profileId ? { ...result, relationState: 'outgoing-pending' } : result))
    }
  }

  return <main className="profile-page friends-page">
    <div className="account-back-row"><Link to="/profile"><ArrowLeft size={17} /> Wróć do profilu</Link></div>
    <section className="profile-heading"><div><span className="eyebrow">SPOŁECZNOŚĆ</span><h1>Znajomi</h1><p>Wyszukuj użytkowników i zarządzaj zaproszeniami.</p></div></section>

    {error && <p className="form-error" role="alert">{error}</p>}
    {message && <p className="form-success" role="status">{message}</p>}

    <section className="account-card friends-search-card">
      <div className="account-card-heading"><span className="account-icon"><Search size={20} /></span><div><h2>Znajdź użytkownika</h2><p>Wyszukaj po nazwie profilu.</p></div></div>
      <form className="friends-search-form" onSubmit={submitSearch}>
        <label className="visually-hidden" htmlFor="friend-search">Nazwa użytkownika</label>
        <input id="friend-search" value={query} onChange={event => { setQuery(event.target.value); setSearched(false) }} minLength={2} maxLength={30} placeholder="Wpisz nazwę użytkownika" />
        <button className="primary-button" disabled={busy || query.trim().length < 2} type="submit"><Search size={16} /> Szukaj</button>
      </form>
      {searchResults.length > 0 && <div className="friends-list">
        {searchResults.map(item => <article className="friend-row" key={item.profileId}>
          <FriendAvatar username={item.username} avatarUrl={item.avatarUrl} />
          <div className="friend-row-copy"><strong>{item.username}</strong><span>{item.visibility === 'public' ? 'Profil publiczny' : 'Profil prywatny'}</span></div>
          {item.relationState === 'none' && <button className="secondary-button friend-action" disabled={busy} onClick={() => void addSearchResult(item)}><UserPlus size={16} /> Dodaj</button>}
          {item.relationState === 'outgoing-pending' && <span className="friend-state">Zaproszenie wysłane</span>}
          {item.relationState === 'incoming-pending' && <span className="friend-state">Oczekuje zaproszenie</span>}
          {item.relationState === 'accepted' && <span className="friend-state">Znajomi</span>}
        </article>)}
      </div>}
      {searched && searchResults.length === 0 && !busy && <p className="profile-section-caption friends-empty-hint">Nie znaleziono użytkowników pasujących do tej nazwy.</p>}
    </section>

    {loading ? <p className="profile-section-caption">Pobieranie znajomych…</p> : <>
      {overview.incomingRequests.length > 0 && <section className="profile-section friends-list-section">
        <div className="profile-section-heading"><div><span className="eyebrow">ZAPROSZENIA</span><h2>Otrzymane</h2></div><span className="profile-section-caption">{overview.incomingRequests.length}</span></div>
        <div className="friends-list">{overview.incomingRequests.map(({ requestId, profile }) => <article className="friend-row" key={requestId}>
          <FriendAvatar username={profile.username} avatarUrl={profile.avatarUrl} />
          <div className="friend-row-copy"><strong>{profile.username}</strong><span>{profile.visibility === 'public' ? 'Profil publiczny' : 'Profil prywatny'}</span></div>
          <div className="friend-row-actions"><button className="primary-button" disabled={busy} onClick={() => void run(() => acceptFriendRequest(requestId), 'Dodano do znajomych.')}><Check size={16} /> Akceptuj</button><button className="friend-text-action" disabled={busy} onClick={() => void run(() => declineFriendRequest(requestId))}><X size={16} /> Odrzuć</button></div>
        </article>)}</div>
      </section>}

      <section className="profile-section friends-list-section">
        <div className="profile-section-heading"><div><span className="eyebrow">TWOJA SIEĆ</span><h2>Lista znajomych</h2></div><span className="profile-section-caption">{overview.friends.length}</span></div>
        {overview.friends.length ? <div className="friends-list">{overview.friends.map(friend => <article className="friend-row" key={friend.profileId}>
          <FriendAvatar username={friend.username} avatarUrl={friend.avatarUrl} />
          <div className="friend-row-copy"><strong>{friend.username}</strong><span>{friend.visibility === 'public' ? [friend.city, friend.bio].filter(Boolean).join(' · ') || 'Profil publiczny' : 'Profil prywatny'}</span></div>
          <div className="friend-row-actions">{friend.visibility === 'public' ? <Link className="secondary-button friend-action" to={`/u/${encodeURIComponent(friend.username)}`} state={{ from: '/profile/friends' }}>Odwiedź profil</Link> : <span className="friend-state">Profil prywatny</span>}<button className="friend-text-action danger" disabled={busy} onClick={() => void run(() => removeFriend(friend.profileId))}><UserMinus size={16} /> Usuń</button></div>
        </article>)}</div> : <div className="profile-empty-state friends-empty"><Users size={27} /><h3>Nie masz jeszcze znajomych</h3><p>Wyszukaj użytkownika po nazwie i wyślij zaproszenie.</p></div>}
      </section>

      {overview.outgoingRequests.length > 0 && <section className="profile-section friends-list-section">
        <div className="profile-section-heading"><div><span className="eyebrow">ZAPROSZENIA</span><h2>Wysłane</h2></div><span className="profile-section-caption">{overview.outgoingRequests.length}</span></div>
        <div className="friends-list">{overview.outgoingRequests.map(({ requestId, profile }) => <article className="friend-row" key={requestId}>
          <FriendAvatar username={profile.username} avatarUrl={profile.avatarUrl} /><div className="friend-row-copy"><strong>{profile.username}</strong><span>Oczekuje na odpowiedź</span></div>
          <button className="friend-text-action" disabled={busy} onClick={() => void run(() => cancelFriendRequest(requestId))}><X size={16} /> Anuluj</button>
        </article>)}</div>
      </section>}
    </>}
    <p className="friends-privacy-note">Profile prywatne nie udostępniają opisu, miasta ani avatara. Samo dodanie do znajomych nie odsłania historii quizów.</p>
  </main>
}

export default FriendsPage
