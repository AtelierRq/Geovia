import {
  Compass,
  House,
  Map,
  UserRound,
  ArrowRight,
  Globe2,
  Flag,
  Landmark,
} from 'lucide-react'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <a href="/" className="logo">
          <div className="logo-icon">
            <Compass size={22} />
          </div>

          <span>Geovia</span>
        </a>

        <nav className="nav-links">
          <a href="/" className="nav-link active">
            <House size={17} />
            <span>Strona główna</span>
          </a>

          <a href="#quizzes" className="nav-link">
            <Map size={17} />
            <span>Quizy</span>
          </a>

          <a href="#profile" className="nav-link">
            <UserRound size={17} />
            <span>Profil</span>
          </a>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <span className="eyebrow">PLATFORMA GEOGRAFICZNA</span>

            <h1>
              Poznaj świat.
              <br />
              <span>Sprawdź swoją wiedzę.</span>
            </h1>

            <p>
              Odkrywaj państwa, stolice, flagi i wiele więcej.
              Wybierz kategorię i sprawdź, ile wiesz o świecie.
            </p>

            <a href="#quizzes" className="primary-button">
              Rozpocznij quiz
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="hero-globe">
            <Globe2 size={220} strokeWidth={1} />
          </div>
        </section>

        <section id="quizzes" className="quiz-section">
          <div className="section-heading">
            <span className="eyebrow">WYBIERZ KATEGORIĘ</span>

            <h2>Co chcesz dzisiaj ćwiczyć?</h2>

            <p>
              Najpierw wybierz kategorię, a następnie tryb quizu.
            </p>
          </div>

          <div className="category-grid">
            <a href="#countries" className="category-card">
              <div className="category-icon">
                <Globe2 size={26} />
              </div>

              <div>
                <h3>Państwa</h3>
                <p>Poznaj państwa świata i ich położenie.</p>
              </div>

              <ArrowRight size={18} className="card-arrow" />
            </a>

            <a href="#capitals" className="category-card">
              <div className="category-icon">
                <Landmark size={26} />
              </div>

              <div>
                <h3>Stolice</h3>
                <p>Sprawdź znajomość stolic państw.</p>
              </div>

              <ArrowRight size={18} className="card-arrow" />
            </a>

            <a href="#flags" className="category-card">
              <div className="category-icon">
                <Flag size={26} />
              </div>

              <div>
                <h3>Flagi</h3>
                <p>Rozpoznawaj flagi państw świata.</p>
              </div>

              <ArrowRight size={18} className="card-arrow" />
            </a>
          </div>
        </section>

        <section className="cta-section">
          <div>
            <span className="eyebrow">ODKRYWAJ ŚWIAT</span>

            <h2>
              Gotowy, żeby sprawdzić
              <br />
              swoją wiedzę?
            </h2>
          </div>

          <a href="#quizzes" className="secondary-button">
            Wybierz quiz
            <ArrowRight size={18} />
          </a>
        </section>
      </main>

      <footer className="footer">
        <span>© 2027 Geovia</span>
        <span>Platforma do nauki geografii świata</span>
      </footer>
    </div>
  )
}

export default App