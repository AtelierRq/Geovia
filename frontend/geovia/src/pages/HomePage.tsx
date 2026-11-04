import { ArrowRight, BookOpen, Clock3, Flame, Globe2, Lightbulb, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import CategoryList from '../components/CategoryList'

const facts = [
  {
    title: 'Państwo otoczone przez jedno państwo',
    text: 'Lesotho jest całkowicie otoczone przez terytorium Republiki Południowej Afryki.',
    tag: 'PAŃSTWA',
    icon: Globe2,
  },
  {
    title: 'Granica między dwoma dniami',
    text: 'Między wyspami Diomedesa na Cieśninie Beringa przebiega międzynarodowa linia zmiany daty.',
    tag: 'WYSPY',
    icon: Lightbulb,
  },
  {
    title: 'Trzy stolice jednego państwa',
    text: 'Republika Południowej Afryki ma trzy stolice: Pretorię, Kapsztad i Bloemfontein.',
    tag: 'STOLICE',
    icon: BookOpen,
  },
]

function HomePage() {
  return (
    <main className="home-page">
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

      <section className="home-section daily-feature-section">
        <div className="daily-feature-card">
          <div className="daily-feature-copy">
            <span className="eyebrow"><Flame size={14}/> WYZWANIE DNIA</span>
            <h2>Stolica w 30 sekund</h2>
            <p>5 państw, 5 stolic i 30 sekund na zdobycie jak największej liczby punktów. Podejmij dzisiejsze wyzwanie i spróbuj pobić swój rekord.</p>
            <div className="daily-feature-meta"><span><BookOpen size={15}/> 5 pytań</span><span><Clock3 size={15}/> 30 sekund</span></div>
            <Link to="/daily-challenge" className="primary-button">Podejmij wyzwanie <ArrowRight size={18}/></Link>
          </div>
          <div className="daily-feature-art"><div className="daily-art-circle"><Globe2 size={108} strokeWidth={1}/><span>60</span></div></div>
        </div>
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

      <section className="home-section content-sections">
        <div className="section-heading home-section-heading">
          <span className="eyebrow"><Sparkles size={14}/> ODKRYWAJ NOWOŚCI</span>
          <h2>Nowe quizy</h2>
          <p>Najnowsze quizy dodane do Geovii.</p>
        </div>
        <div className="home-empty-state">
          <div className="home-empty-icon"><Sparkles size={23}/></div>
          <div><strong>Nowe quizy pojawią się tutaj</strong><p>Gdy w katalogu pojawią się kolejne quizy z datą publikacji, pokażemy je w tej sekcji.</p></div>
          <Link to="/quizzes">Przeglądaj katalog <ArrowRight size={16}/></Link>
        </div>
      </section>

      <section className="home-section content-sections">
        <div className="section-heading home-section-heading">
          <span className="eyebrow"><TrendingUp size={14}/> CO GRAJĄ INNI</span>
          <h2>Popularne quizy</h2>
          <p>Quizy najczęściej uruchamiane przez społeczność Geovii.</p>
        </div>
        <div className="home-empty-state">
          <div className="home-empty-icon"><TrendingUp size={23}/></div>
          <div><strong>Popularność quizów już wkrótce</strong><p>Ta sekcja zacznie pokazywać najczęściej uruchamiane quizy, gdy zaczniemy zbierać statystyki rozgrywek.</p></div>
          <Link to="/quizzes">Przeglądaj katalog <ArrowRight size={16}/></Link>
        </div>
      </section>

      <section className="home-section facts-section">
        <div className="section-heading home-section-heading">
          <span className="eyebrow"><Lightbulb size={14}/> WIEDZA O ŚWIECIE</span>
          <h2>Ciekawostki geograficzne</h2>
          <p>Krótkie informacje o państwach, granicach, wyspach, stolicach i niezwykłych miejscach.</p>
        </div>
        <div className="facts-grid">
          {facts.map((fact) => {
            const Icon = fact.icon
            return (
              <article className="fact-card" key={fact.title}>
                <div className="fact-card-icon"><Icon size={23}/></div>
                <span className="eyebrow">{fact.tag}</span>
                <h3>{fact.title}</h3>
                <p>{fact.text}</p>
              </article>
            )
          })}
        </div>
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
