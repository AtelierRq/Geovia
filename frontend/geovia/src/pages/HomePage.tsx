import { ArrowRight, Globe2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import CategoryList from '../components/CategoryList'

function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">PLATFORMA GEOGRAFICZNA</span>
          <h1>Poznaj świat.<br /><span>Sprawdź swoją wiedzę.</span></h1>
          <p>
            Odkrywaj państwa, stolice, flagi i wiele więcej.
            Wybierz kategorię i sprawdź, ile wiesz o świecie.
          </p>
          <Link to="/quizzes" className="primary-button">
            Rozpocznij quiz <ArrowRight size={18} />
          </Link>
        </div>
        <div className="hero-globe"><Globe2 size={220} strokeWidth={1} /></div>
      </section>

      <section className="quiz-section">
        <div className="section-heading">
          <span className="eyebrow">WYBIERZ KATEGORIĘ</span>
          <h2>Co chcesz dzisiaj ćwiczyć?</h2>
          <p>Wybierz kategorię i przejdź do dostępnych quizów.</p>
        </div>
        <CategoryList carousel />
        <Link to="/quizzes" className="primary-button catalog-button">
          Zobacz wszystkie quizy <ArrowRight size={18} />
        </Link>
      </section>

      <section className="cta-section">
        <div>
          <span className="eyebrow">ODKRYWAJ ŚWIAT</span>
          <h2>Gotowy, żeby sprawdzić<br />swoją wiedzę?</h2>
        </div>
        <Link to="/quizzes" className="secondary-button">
          Wybierz quiz <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  )
}

export default HomePage
