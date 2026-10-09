import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Compass,
  House,
  Map,
  UserRound,
  ArrowRight,
  Globe2,
  Flag,
  Landmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import './App.css'

function App() {
  const categoryRowRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = useCallback(() => {
    const row = categoryRowRef.current

    if (!row) return

    const maxScrollLeft = row.scrollWidth - row.clientWidth
    const currentScrollLeft = Math.max(0, row.scrollLeft)

    setCanScrollLeft(currentScrollLeft > 5)
    setCanScrollRight(maxScrollLeft - currentScrollLeft > 5)
  }, [])

  const scrollCategories = (direction: 'left' | 'right') => {
    const row = categoryRowRef.current

    if (!row) return

    row.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    const row = categoryRowRef.current

    if (!row) return

    updateScrollButtons()

    row.addEventListener('scroll', updateScrollButtons)
    window.addEventListener('resize', updateScrollButtons)

    const observer = new ResizeObserver(updateScrollButtons)
    observer.observe(row)

    return () => {
      row.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
      observer.disconnect()
    }
  }, [updateScrollButtons])

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

        <div className="category-carousel">
          {canScrollLeft && (
            <button
              type="button"
              className="carousel-arrow carousel-arrow-left"
              aria-label="Poprzednie kategorie"
              onClick={() => scrollCategories('left')}
            >
              <ChevronLeft size={22} />
            </button>
          )}

              <div className="category-row" ref={categoryRowRef}>
                <a href="#countries" className="category-card">
                  <div className="category-image countries-image">
                    <Globe2 size={42} />
                  </div>

                  <div className="category-card-content">
                    <h3>Państwa</h3>
                    <p>Poznaj państwa świata i ich położenie.</p>
                  </div>

                  <ArrowRight size={18} className="card-arrow" />
                </a>

                <a href="#capitals" className="category-card">
                  <div className="category-image capitals-image">
                    <Landmark size={42} />
                  </div>

                  <div className="category-card-content">
                    <h3>Stolice</h3>
                    <p>Sprawdź znajomość stolic państw.</p>
                  </div>

                  <ArrowRight size={18} className="card-arrow" />
                </a>

                <a href="#flags" className="category-card">
                  <div className="category-image flags-image">
                    <Flag size={42} />
                  </div>

                  <div className="category-card-content">
                    <h3>Flagi</h3>
                    <p>Rozpoznawaj flagi państw świata.</p>
                  </div>

                  <ArrowRight size={18} className="card-arrow" />
                </a>

                <a href="#seas" className="category-card">
                  <div className="category-image seas-image">
                    <Globe2 size={42} />
                  </div>

                  <div className="category-card-content">
                    <h3>Morza</h3>
                    <p>Sprawdź swoją wiedzę o morzach świata.</p>
                  </div>

                  <ArrowRight size={18} className="card-arrow" />
                </a>

                <a href="#rivers" className="category-card">
                  <div className="category-image rivers-image">
                    <Globe2 size={42} />
                  </div>

                  <div className="category-card-content">
                    <h3>Rzeki</h3>
                    <p>Poznaj największe rzeki świata.</p>
                  </div>

                  <ArrowRight size={18} className="card-arrow" />
                </a>
              </div>

            {canScrollRight && (
              <button
                type="button"
                className="carousel-arrow carousel-arrow-right"
                aria-label="Następne kategorie"
                onClick={() => scrollCategories('right')}
              >
                <ChevronRight size={22} />
              </button>
            )}
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
        <span>© 2026 Geovia</span>
        <span>Platforma do nauki geografii świata</span>
      </footer>
    </div>
  )
}

export default App