import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { categories } from '../data/categories'
import { areas } from '../data/areas'

function CategoryPage() {
  const { categoryId } = useParams()
  const category = categories.find((item) => item.id === categoryId)

  if (!category) {
    return (
      <main className="catalog-page">
        <section className="catalog-heading">
          <h1>Nie znaleziono kategorii</h1>
          <Link to="/quizzes" className="primary-button">Wróć do katalogu</Link>
        </section>
      </main>
    )
  }

  const Icon = category.icon

  return (
    <main className="area-page">
      <Link to="/quizzes" className="back-link">
        <ArrowLeft size={17} /> Wszystkie kategorie
      </Link>

      <section className="catalog-heading">
        <div className={`area-title-icon ${category.imageClass}`}>
          <Icon size={32} />
        </div>
        <span className="eyebrow">WYBRANA KATEGORIA</span>
        <h1>{category.title}</h1>
        <p>Wybierz obszar geograficzny, z którego chcesz rozwiązywać quiz.</p>
      </section>

      <section className="area-section">
        <div className="area-section-heading">
          <h2>Wybierz obszar</h2>
          <p>Możesz ćwiczyć wiedzę z całego świata lub wybranego kontynentu.</p>
        </div>

        <div className="area-grid">
          {areas.map((area) => {
            const AreaIcon = area.icon

            return (
              <button
                type="button"
                className="category-card area-selection-card"
                key={area.id}
                onClick={() => {
                  // Następny etap: wybór trybu quizu.
                }}
              >
                <div className={`category-image ${area.imageClass}`}>
                  <AreaIcon size={42} />
                </div>
                <div className="category-card-content">
                  <h3>{area.name}</h3>
                  <p>{area.description}</p>
                </div>
                <ArrowRight size={18} className="card-arrow" />
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default CategoryPage
