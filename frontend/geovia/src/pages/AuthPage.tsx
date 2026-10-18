import { Compass, LogIn, UserRoundPlus } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import '../styles/profile.css'

function AuthPage() {
  const { user, signInDemo } = useUser()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/profile" replace />
  }

  function enterDemo() {
    signInDemo()
    navigate('/profile')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">
          <Compass size={28} />
        </div>
        <span className="eyebrow">WITAJ W GEOVII</span>
        <h1>Zaloguj się lub dołącz</h1>
        <p>
          W przyszłości tutaj znajdzie się formularz logowania i rejestracji.
          Na razie możesz przejść do demonstracyjnego profilu, aby przetestować
          interfejs.
        </p>
        <button className="primary-button auth-action" onClick={enterDemo}>
          <LogIn size={17} /> Wejdź jako użytkownik demonstracyjny
        </button>
        <button className="secondary-button auth-action" onClick={enterDemo}>
          <UserRoundPlus size={17} /> Wypróbuj profil
        </button>
        <small>
          To tryb demonstracyjny — nie tworzy prawdziwego konta ani nie wysyła
          danych na serwer.
        </small>
      </section>
    </main>
  )
}

export default AuthPage
