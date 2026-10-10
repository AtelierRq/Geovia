import { ArrowLeft, Construction } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { categories } from '../data/categories'
import { areas } from '../data/areas'
import { quizModesByCategoryAndArea } from '../data/quizModes'

function QuizPlaceholderPage() {
  const { categoryId, areaId, modeId } = useParams()
  const category = categories.find((item) => item.id === categoryId)
  const area = areas.find((item) => item.id === areaId)
  const mode = quizModesByCategoryAndArea[categoryId ?? '']?.[areaId ?? '']?.find((item) => item.id === modeId)

  if (!category || !area || !mode) {
    return (
      <main className="catalog-page">
        <section className="catalog-heading">
          <h1>Nie znaleziono trybu quizu</h1>
          <Link to="/quizzes" className="primary-button">Wróć do katalogu</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="modes-page quiz-placeholder-page">
      <Link to={`/categories/${category.id}/areas/${area.id}/modes`} className="back-link">
        <ArrowLeft size={17} /> Wróć do trybów
      </Link>
      <section className="quiz-placeholder-card">
        <span className="mode-card-icon"><Construction size={28} /></span>
        <span className="eyebrow">TRYB WYBRANY</span>
        <h1>{mode.title}</h1>
        <p>{category.title} · {area.name}</p>
        <p>Ten tryb jest już uwzględniony w nawigacji. W kolejnym etapie przygotujemy właściwy quiz i interaktywną mapę.</p>
        <Link to={`/categories/${category.id}/areas/${area.id}/modes`} className="primary-button">Wybierz inny tryb</Link>
      </section>
    </main>
  )
}

export default QuizPlaceholderPage
