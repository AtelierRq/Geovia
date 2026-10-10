import { Compass, House, Map, UserRound } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <div className="logo-icon"><Compass size={22} /></div>
        <span>Geovia</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <House size={17} />
          <span>Strona główna</span>
        </NavLink>
        <NavLink to="/quizzes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Map size={17} />
          <span>Quizy</span>
        </NavLink>
        <a href="#profile" className="nav-link">
          <UserRound size={17} />
          <span>Profil</span>
        </a>
      </nav>
    </header>
  )
}

export default Navbar
