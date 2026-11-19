import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Compass, LogIn, UserRoundPlus } from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { verifyEmailToken } from '../api/profile'
import '../styles/profile.css'

function AuthPage() {
  const { user, login, register, refreshBackendProfile } = useUser()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const verificationToken = params.get('token')
  const [registerMode, setRegisterMode] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const verificationStarted = useRef<string | null>(null)

  useEffect(() => {
    if (!verificationToken) return
    if (verificationStarted.current === verificationToken) return
    verificationStarted.current = verificationToken
    setBusy(true)
    verifyEmailToken(verificationToken)
      .then(async () => {
        if (user) await refreshBackendProfile()
        setMessage(user ? 'Nowy adres e-mail został potwierdzony.' : 'Adres e-mail został potwierdzony. Możesz się zalogować.')
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Nie udało się potwierdzić adresu.'))
      .finally(() => setBusy(false))
  }, [verificationToken])
  if (user) return <Navigate to="/profile" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      if (registerMode) {
        await register(email, password, username)
        setMessage('Konto utworzone. Otwórz wiadomość e-mail od Geovii i kliknij link potwierdzający.')
      } else {
        await login(email, password)
        navigate('/profile')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Nie udało się wykonać operacji.')
    } finally { setBusy(false) }
  }

  return <main className="auth-page">
    <section className="auth-card">
      <div className="auth-logo"><Compass size={28} /></div>
      <span className="eyebrow">WITAJ W GEOVII</span>
      <h1>{registerMode ? 'Utwórz konto' : 'Zaloguj się'}</h1>
      <p>{registerMode ? 'Załóż konto, aby zapisywać swoje wyniki i postępy w nauce.' : 'Zaloguj się, aby wrócić do swojego profilu i historii quizów.'}</p>
      <form className="account-form auth-form" onSubmit={submit}>
        {registerMode && <label>Nazwa użytkownika<input value={username} onChange={event => setUsername(event.target.value)} required minLength={2} maxLength={30} autoComplete="username" /></label>}
        <label>Adres e-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} autoComplete="email" /></label>
        <label>Hasło<input type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={registerMode ? 10 : 1} maxLength={128} autoComplete={registerMode ? 'new-password' : 'current-password'} />{registerMode && <span className="field-help">Co najmniej 10 znaków.</span>}</label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="form-success" role="status">{message}</p>}
        <button className="primary-button auth-action" disabled={busy} type="submit">{registerMode ? <UserRoundPlus size={17} /> : <LogIn size={17} />}{busy ? ' Proszę czekać…' : registerMode ? ' Utwórz konto' : ' Zaloguj się'}</button>
      </form>
      <button type="button" className="secondary-button auth-action" onClick={() => { setRegisterMode(!registerMode); setError(''); setMessage('') }}>
        {registerMode ? 'Mam już konto — zaloguj się' : 'Nie masz konta? Zarejestruj się'}
      </button>
      <small>Rejestracja wymaga potwierdzenia adresu e-mail.</small>
      <Link to="/" className="account-back-link">Wróć na stronę główną</Link>
    </section>
  </main>
}
export default AuthPage
