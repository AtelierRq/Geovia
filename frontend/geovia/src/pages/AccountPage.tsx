import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, KeyRound, LogOut, Mail, Trash2, Monitor } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getAccountSessions, revokeAccountSession, type AccountSession } from '../api/profile'
import '../styles/profile.css'

function AccountPage() {
  const { user, changeEmail, changePassword, signOut, deleteAccount } = useUser()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [sessions, setSessions] = useState<AccountSession[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!user) return
    let active = true
    getAccountSessions().then(value => { if (active) setSessions(value) })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Nie udało się pobrać sesji.') })
    return () => { active = false }
  }, [user?.email])
  if (!user) return <Navigate to="/login" replace />

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try { await changeEmail(email.trim()); setEmail(''); setMessage('Wysłaliśmy link potwierdzający na nowy adres. Zmiana zacznie obowiązywać po kliknięciu linku.') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Nie udało się zlecić zmiany adresu.') }
    finally { setBusy(false) }
  }
  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try { await changePassword(currentPassword, newPassword); setCurrentPassword(''); setNewPassword(''); setMessage('Hasło zostało zmienione. Pozostałe sesje zostały wylogowane.') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Nie udało się zmienić hasła.') }
    finally { setBusy(false) }
  }
  async function logout() { await signOut(); navigate('/') }
  async function revoke(session: AccountSession) {
    setBusy(true); setError(''); setMessage('')
    try {
      await revokeAccountSession(session.id)
      if (session.current) { await signOut(); navigate('/'); return }
      setSessions(previous => previous.filter(item => item.id !== session.id))
      setMessage('Sesja została wylogowana.')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Nie udało się wylogować sesji.') }
    finally { setBusy(false) }
  }
  async function submitDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('')
    try { await deleteAccount(deleteEmail.trim(), deletePassword); navigate('/') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Nie udało się usunąć konta.') }
    finally { setBusy(false) }
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  }

  return <main className="profile-page account-page">
    <div className="account-back-row"><Link to="/profile"><ArrowLeft size={17} /> Wróć do profilu</Link></div>
    <section className="profile-heading"><div><span className="eyebrow">USTAWIENIA KONTA</span><h1>Ustawienia konta</h1><p>Zarządzaj adresem e-mail, hasłem i sesjami swojego konta.</p></div></section>
    <div className="account-settings-layout">
      <section className="account-card account-settings-card">
        <div className="settings-section-title"><div className="settings-icon"><Mail size={20} /></div><div><h2>Adres e-mail</h2><p>Aktualny adres logowania: <strong>{user.email}</strong></p></div></div>
        <form className="account-form" onSubmit={submitEmail}>
          <label>Nowy adres e-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} autoComplete="email" /></label>
          <p className="settings-description">Nowy adres zacznie obowiązywać po potwierdzeniu linkiem wysłanym na tę skrzynkę.</p>
          <button className="primary-button" type="submit" disabled={busy}>Wyślij link potwierdzający</button>
        </form>
      </section>
      <section className="account-card account-settings-card">
        <div className="settings-section-title"><div className="settings-icon"><KeyRound size={20} /></div><div><h2>Hasło</h2><p>Hasło jest przechowywane w postaci bezpiecznego skrótu.</p></div></div>
        <form className="account-form" onSubmit={submitPassword}>
          <label>Obecne hasło<input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required autoComplete="current-password" /></label>
          <label>Nowe hasło<input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required minLength={10} maxLength={128} autoComplete="new-password" /><span className="field-help">Co najmniej 10 znaków.</span></label>
          <button className="primary-button" type="submit" disabled={busy}>Zmień hasło</button>
        </form>
      </section>
      <section className="account-card account-settings-card account-danger-card">
        <div className="settings-section-title"><div className="settings-icon danger-icon"><Trash2 size={20} /></div><div><h2>Usuń konto</h2><p>Usunięcie konta trwale usuwa profil i zapisane wyniki quizów.</p></div></div>
        <form className="account-form" onSubmit={submitDelete}>
          <label>Potwierdź adres e-mail<input type="email" value={deleteEmail} onChange={event => setDeleteEmail(event.target.value)} required autoComplete="email" /></label>
          <label>Potwierdź hasło<input type="password" value={deletePassword} onChange={event => setDeletePassword(event.target.value)} required autoComplete="current-password" /></label>
          <button className="danger-outline-button" type="submit" disabled={busy}><Trash2 size={16} /> Usuń konto i dane</button>
        </form>
      </section>
      <section className="account-card account-settings-card sessions-card">
        <div className="settings-section-title"><div className="settings-icon"><Monitor size={20} /></div><div><h2>Aktywne sesje</h2><p>Sesje wygasają automatycznie po 12 godzinach.</p></div></div>
        {sessions.length ? <div className="account-sessions-list">{sessions.map(session => (
          <article className="account-session-row" key={session.id}>
            <div className="account-session-icon"><Monitor size={18} /></div>
            <div className="account-session-details">
              <strong>{session.current ? 'Ta sesja (bieżąca)' : 'Zalogowana sesja'}</strong>
              <span>{session.userAgent || 'Nieznana przeglądarka'}</span>
              <small>Utworzono: {formatDate(session.createdAt)} · Wygasa: {formatDate(session.expiresAt)}</small>
            </div>
            <button className="text-danger-button" type="button" disabled={busy} onClick={() => void revoke(session)}>
              <LogOut size={15} /> Wyloguj
            </button>
          </article>
        ))}</div> : <p className="settings-description">Nie znaleziono aktywnych sesji.</p>}
      </section>
    </div>
    {(error || message) && <p className={error ? 'form-error' : 'form-success'} role={error ? 'alert' : 'status'}>{error || message}</p>}
    <section className="account-logout-section"><div><h2>Wylogowanie</h2><p>Wyloguj się z bieżącej sesji.</p></div><button className="account-logout-button" type="button" onClick={logout}><LogOut size={17} /> Wyloguj</button></section>
  </main>
}
export default AccountPage
