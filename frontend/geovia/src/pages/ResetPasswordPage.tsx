import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/profile'
import { useUser } from '../context/UserContext'
import '../styles/profile.css'

function ResetPasswordPage() {
  const [params] = useSearchParams()
  const { signOut, user } = useUser()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('')
    if (!token) { setError('Link resetujący jest nieprawidłowy lub nie zawiera tokenu.'); return }
    if (password !== confirmation) { setError('Hasła nie są takie same.'); return }
    setBusy(true)
    try {
      await resetPassword(token, password)
      if (user) await signOut()
      setMessage('Hasło zostało zmienione. Możesz zalogować się nowym hasłem.')
      setPassword(''); setConfirmation('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Nie udało się zmienić hasła.')
    } finally { setBusy(false) }
  }

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-logo"><KeyRound size={27} /></div>
    <span className="eyebrow">USTAWIENIA KONTA</span>
    <h1>Ustaw nowe hasło</h1>
    <p>Link resetujący jest ważny przez godzinę i może być użyty tylko raz.</p>
    <form className="account-form auth-form" onSubmit={submit}>
      <label>Nowe hasło<input type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={10} maxLength={128} autoComplete="new-password" /><span className="field-help">Co najmniej 10 znaków.</span></label>
      <label>Powtórz nowe hasło<input type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required minLength={10} maxLength={128} autoComplete="new-password" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}
      {!message && <button className="primary-button auth-action" type="submit" disabled={busy}>{busy ? 'Zapisywanie…' : 'Zmień hasło'}</button>}
    </form>
    {message ? <Link className="secondary-button auth-action" to="/login">Przejdź do logowania</Link> : <Link className="account-back-link" to="/login">Wróć do logowania</Link>}
  </section></main>
}
export default ResetPasswordPage
