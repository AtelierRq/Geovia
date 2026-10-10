import { ArrowLeft, ArrowRight, Flag, Map, MapPin, Type, ListChecks } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { categories } from '../data/categories'
import { areas } from '../data/areas'
import { quizModesByCategoryAndArea } from '../data/quizModes'

const modeIcons = { type: Type, 'map-pin': MapPin, map: Map, flag: Flag, 'list-check': ListChecks }

function QuizModesPage() {
  const { categoryId, areaId } = useParams()
  const navigate = useNavigate()
  const category = categories.find((item) => item.id === categoryId)
  const area = areas.find((item) => item.id === areaId)

  if (!category || !area) {
    return (
      <main className="catalog-page">
        <section className="catalog-heading">
          <h1>Nie znaleziono kategorii lub obszaru</h1>
          <Link to="/quizzes" className="primary-button">Wróć do katalogu</Link>
        </section>
      </main>
    )
  }

  const modes = quizModesByCategoryAndArea[category.id]?.[area.id] ?? []
  const CategoryIcon = category.icon
  const AreaIcon = area.icon

  return (
    <main className="modes-page">
      <Link to={`/categories/${category.id}`} className="back-link">
        <ArrowLeft size={17} /> Wybór obszaru
      </Link>

      <section className="catalog-heading modes-heading">
        <div className={`area-title-icon ${category.imageClass}`}>
          <CategoryIcon size={30} />
        </div>
        <span className="eyebrow">WYBRANA KATEGORIA I OBSZAR</span>
        <h1>{category.title} — {area.name}</h1>
        <p>Wybierz sposób, w jaki chcesz sprawdzić swoją wiedzę.</p>
        <div className="selected-area-label"><AreaIcon size={17} /> {area.name}</div>
      </section>

      <section className="modes-section">
        <div className="area-section-heading">
          <h2>Dostępne tryby quizu</h2>
          <p>Lista zależy od wybranej kategorii i obszaru.</p>
        </div>

        {modes.length > 0 ? (
          <div className="modes-grid">
            {modes.map((mode) => {
              const ModeIcon = modeIcons[mode.icon]
              return (
                <button
                  className="mode-card"
                  type="button"
                  key={mode.id}
                  onClick={() => navigate(`/quiz/${category.id}/${area.id}/${mode.id}`)}
                >
                  <span className="mode-card-icon"><ModeIcon size={23} /></span>
                  <span className="mode-card-copy">
                    <strong>{mode.title}</strong>
                    <span>{mode.description}</span>
                  </span>
                  <ArrowRight className="mode-card-arrow" size={19} />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="modes-empty">
            <p>Tryby dla tej kategorii i obszaru nie są jeszcze dostępne.</p>
            <p>Wróć później — będziemy stopniowo dodawać kolejne ćwiczenia.</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default QuizModesPage
