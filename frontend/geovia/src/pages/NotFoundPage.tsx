import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="catalog-page">
      <section className="catalog-heading">
        <h1>Nie znaleziono strony</h1>
        <Link to="/" className="primary-button">Strona główna</Link>
      </section>
    </main>
  )
}

export default NotFoundPage
