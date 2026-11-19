import { useState, type FormEvent } from 'react'
import { ArrowLeft, KeyRound, LogOut, Mail, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import '../styles/profile.css'

function AccountPage() {
  const { user, changeEmail, changePassword, signOut } = useUser()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
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

  return <main className="profile-page account-page">
    <div className="account-back-row"><Link to="/profile"><ArrowLeft size={17} /> Wróć do profilu</Link></div>
    <section className="profile-heading"><div><span className="eyebrow">KONTO I BEZPIECZEŃSTWO</span><h1>Ustawienia konta</h1><p>Zarządzaj adresem e-mail i hasłem swojego konta.</p></div></section>
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
      <section className="account-card account-settings-card">
        <div className="settings-section-title"><div className="settings-icon"><ShieldCheck size={20} /></div><div><h2>Bezpieczeństwo</h2><p>Sesja logowania jest przechowywana w ciasteczku HttpOnly.</p></div></div>
        <p className="settings-description">Adres e-mail służy do logowania. Zmiany wymagają potwierdzenia nowego adresu.</p>
      </section>
    </div>
    {(error || message) && <p className={error ? 'form-error' : 'form-success'} role={error ? 'alert' : 'status'}>{error || message}</p>}
    <section className="account-logout-section"><div><h2>Wylogowanie</h2><p>Wyloguj się z bieżącej sesji.</p></div><button className="account-logout-button" type="button" onClick={logout}><LogOut size={17} /> Wyloguj</button></section>
  </main>
}
export default AccountPage
