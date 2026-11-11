import type { ComponentType } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type CardCategory = {
  id: string
  title: string
  description: string
  icon: ComponentType<{ size?: number }>
  image: string
}

function CategoryCard({ category }: { category: CardCategory }) {
  return (
    <Link to={`/categories/${category.id}`} className="category-card">
      <div className="category-image">
        <img
          src={category.image}
          alt=""
          className="category-image-photo"
        />
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
