import CategoryList from '../components/CategoryList'

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

export default QuizCatalogPage
