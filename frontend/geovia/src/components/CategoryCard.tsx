import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type CardCategory = {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ size?: number }>
  imageClass: string
}

function CategoryCard({ category }: { category: CardCategory }) {
  const Icon = category.icon

  return (
    <Link to={`/categories/${category.id}`} className="category-card">
      <div className={`category-image ${category.imageClass}`}>
        <Icon size={42} />
      </div>
      <div className="category-card-content">
        <h3>{category.title}</h3>
        <p>{category.description}</p>
      </div>
      <ArrowRight size={18} className="card-arrow" />
    </Link>
  )
}

export default CategoryCard
