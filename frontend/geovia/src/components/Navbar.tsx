import { Compass, House, Map, UserRound, LogIn } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useUser } from '../context/UserContext'

function Navbar() {
  const { user } = useUser()
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <div className="logo-icon"><Compass size={22} /></div>
        <span>Geovia</span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><House size={17} /><span>Strona główna</span></NavLink>
        <NavLink to="/quizzes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Map size={17} /><span>Quizy</span></NavLink>
        {user ? <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><UserRound size={17} /><span>Profil</span></NavLink> : <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><LogIn size={17} /><span>Zaloguj / Zarejestruj</span></NavLink>}
      </nav>
    </header>
  )
}
export default Navbar
