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
  Waves,
  Droplets,
  Earth,
  ArrowLeft,
} from 'lucide-react'
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  Link,
  useParams,
} from 'react-router-dom'
import './App.css'

const categories = [
  {
    id: 'countries',
    title: 'Państwa',
    description: 'Poznaj państwa świata i ich położenie.',
    icon: Globe2,
    imageClass: 'countries-image',
  },
  {
    id: 'capitals',
    title: 'Stolice',
    description: 'Sprawdź znajomość stolic państw.',
    icon: Landmark,
    imageClass: 'capitals-image',
  },
  {
    id: 'flags',
    title: 'Flagi',
    description: 'Rozpoznawaj flagi państw świata.',
    icon: Flag,
    imageClass: 'flags-image',
  },
  {
    id: 'seas',
    title: 'Morza',
    description: 'Sprawdź swoją wiedzę o morzach świata.',
    icon: Waves,
    imageClass: 'seas-image',
  },
  {
    id: 'rivers',
    title: 'Rzeki',
    description: 'Poznaj największe rzeki świata.',
    icon: Droplets,
    imageClass: 'rivers-image',
  },
]


const areas = [
  {
    id: 'world',
    name: 'Cały świat',
    description: 'Sprawdź swoją wiedzę z całego świata.',
    icon: Earth,
    imageClass: 'countries-image',
  },
  {
    id: 'africa',
    name: 'Afryka',
    description: 'Poznaj geografię Afryki.',
    icon: Globe2,
    imageClass: 'capitals-image',
  },
  {
    id: 'asia',
    name: 'Azja',
    description: 'Poznaj geografię Azji.',
    icon: Globe2,
    imageClass: 'flags-image',
  },
  {
    id: 'europe',
    name: 'Europa',
    description: 'Poznaj geografię Europy.',
    icon: Globe2,
    imageClass: 'seas-image',
  },
  {
    id: 'north-america',
    name: 'Ameryka Północna',
    description: 'Poznaj geografię Ameryki Północnej.',
    icon: Globe2,
    imageClass: 'rivers-image',
  },
  {
    id: 'south-america',
    name: 'Ameryka Południowa',
    description: 'Poznaj geografię Ameryki Południowej.',
    icon: Globe2,
    imageClass: 'countries-image',
  },
  {
    id: 'oceania',
    name: 'Oceania',
    description: 'Poznaj geografię Oceanii.',
    icon: Globe2,
    imageClass: 'flags-image',
  },
]


function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <div className="logo-icon"><Compass size={22} /></div>
        <span>Geovia</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <House size={17} />
          <span>Strona główna</span>
        </NavLink>
        <NavLink to="/quizzes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Map size={17} />
          <span>Quizy</span>
        </NavLink>
        <a href="#profile" className="nav-link">
          <UserRound size={17} />
          <span>Profil</span>
        </a>
      </nav>
    </header>
  )
}

function CategoryCard({ category }: { category: (typeof categories)[number] }) {
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

function QuizCatalogPage() {
  return (
    <main className="catalog-page">
      <section className="catalog-heading">
        <span className="eyebrow">KATALOG QUIZÓW</span>
        <h1>Odkrywaj świat kategoriami</h1>
        <p>Wybierz temat, który chcesz przećwiczyć. W kolejnych krokach wybierzesz obszar i tryb quizu.</p>
      </section>
      <section className="catalog-section">
        <CategoryList />
      </section>
    </main>
  )
}

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

function Footer() {
  return (
    <footer className="footer">
      <span>© 2026 Geovia</span>
      <span>Platforma do nauki geografii świata</span>
    </footer>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quizzes" element={<QuizCatalogPage />} />
          <Route path="/categories/:categoryId" element={<CategoryPage />} />
          <Route path="*" element={
            <main className="catalog-page">
              <section className="catalog-heading">
                <h1>Nie znaleziono strony</h1>
                <Link to="/" className="primary-button">Strona główna</Link>
              </section>
            </main>
          } />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App