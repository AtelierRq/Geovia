import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Compass, KeyRound, LogIn, Mail, UserRoundPlus } from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { requestPasswordReset, resendVerification, verifyEmailToken } from '../api/profile'
import { useUser } from '../context/UserContext'
import '../styles/profile.css'

type AuthMode = 'login' | 'register' | 'resend' | 'forgot'

function AuthPage() {
  const { user, login, register, refreshBackendProfile } = useUser()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const verificationToken = params.get('token')
  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const verificationStarted = useRef<string | null>(null)

  useEffect(() => {
    if (!verificationToken || verificationStarted.current === verificationToken) return
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

  const title = mode === 'register' ? 'Utwórz konto' : mode === 'forgot' ? 'Reset hasła' : mode === 'resend' ? 'Potwierdź adres e-mail' : 'Zaloguj się'
  const description = mode === 'register'
    ? 'Załóż konto, aby zapisywać swoje wyniki i postępy w nauce.'
    : mode === 'forgot'
      ? 'Podaj adres e-mail konta. Wyślemy link do ustawienia nowego hasła.'
      : mode === 'resend'
        ? 'Wyślemy ponownie link weryfikacyjny, jeśli konto oczekuje na potwierdzenie.'
        : 'Zaloguj się, aby wrócić do swojego profilu i historii quizów.'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      if (mode === 'register') {
        await register(email, password, username)
        setMessage('Konto utworzone. Otwórz wiadomość e-mail od Geovii i kliknij link potwierdzający.')
      } else if (mode === 'resend') {
        const response = await resendVerification(email)
        setMessage(response.message)
      } else if (mode === 'forgot') {
        const response = await requestPasswordReset(email)
        setMessage(response.message)
      } else {
        await login(email, password)
        navigate('/profile')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Nie udało się wykonać operacji.')
    } finally { setBusy(false) }
  }

  function switchMode(next: AuthMode) { setMode(next); setError(''); setMessage('') }

  return <main className="auth-page">
    <section className="auth-card">
      <div className="auth-logo"><Compass size={28} /></div>
      <span className="eyebrow">WITAJ W GEOVII</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <form className="account-form auth-form" onSubmit={submit}>
        {mode === 'register' && <label>Nazwa użytkownika<input value={username} onChange={event => setUsername(event.target.value)} required minLength={2} maxLength={30} autoComplete="username" /></label>}
        <label>Adres e-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} autoComplete="email" /></label>
        {(mode === 'login' || mode === 'register') && <label>Hasło<input type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={mode === 'register' ? 10 : 1} maxLength={128} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />{mode === 'register' && <span className="field-help">Co najmniej 10 znaków.</span>}</label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="form-success" role="status">{message}</p>}
        <button className="primary-button auth-action" disabled={busy} type="submit">
          {mode === 'register' ? <UserRoundPlus size={17} /> : mode === 'forgot' ? <KeyRound size={17} /> : mode === 'resend' ? <Mail size={17} /> : <LogIn size={17} />}
          {busy ? ' Proszę czekać…' : mode === 'register' ? ' Utwórz konto' : mode === 'forgot' ? ' Wyślij link resetujący' : mode === 'resend' ? ' Wyślij link ponownie' : ' Zaloguj się'}
        </button>
      </form>
      {mode === 'login' ? <>
        <button type="button" className="secondary-button auth-action" onClick={() => switchMode('register')}>Nie masz konta? Zarejestruj się</button>
        <div className="auth-utility-links">
          <button type="button" onClick={() => switchMode('forgot')}>Nie pamiętam hasła</button>
          <button type="button" onClick={() => switchMode('resend')}>Wyślij ponownie link weryfikacyjny</button>
        </div>
      </> : <button type="button" className="secondary-button auth-action" onClick={() => switchMode('login')}>Wróć do logowania</button>}
      <small>Rejestracja wymaga potwierdzenia adresu e-mail.</small>
      <Link to="/" className="account-back-link">Wróć na stronę główną</Link>
    </section>
  </main>
}
export default AuthPage
