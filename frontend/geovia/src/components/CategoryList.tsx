import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { categories } from '../data/categories'
import CategoryCard from './CategoryCard'

function CategoryList({ carousel = false }: { carousel?: boolean }) {
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
    categoryRowRef.current?.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    if (!carousel) return
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
  }, [carousel, updateScrollButtons])

  return (
    <div className={carousel ? 'category-carousel' : 'catalog-grid'}>
      {carousel && canScrollLeft && (
        <button type="button" className="carousel-arrow carousel-arrow-left"
          aria-label="Poprzednie kategorie" onClick={() => scrollCategories('left')}>
          <ChevronLeft size={22} />
        </button>
      )}

      <div className={carousel ? 'category-row' : 'catalog-category-row'} ref={categoryRowRef}>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {carousel && canScrollRight && (
        <button type="button" className="carousel-arrow carousel-arrow-right"
          aria-label="Następne kategorie" onClick={() => scrollCategories('right')}>
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  )
}

export default CategoryList
