import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import QuizCatalogPage from './pages/QuizCatalogPage'
import CategoryPage from './pages/CategoryPage'
import NotFoundPage from './pages/NotFoundPage'
import QuizModesPage from './pages/QuizModesPage'
import QuizPlaceholderPage from './pages/QuizPlaceholderPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quizzes" element={<QuizCatalogPage />} />
          <Route path="/categories/:categoryId" element={<CategoryPage />} />
          <Route path="/categories/:categoryId/areas/:areaId/modes" element={<QuizModesPage />} />
          <Route path="/quiz/:categoryId/:areaId/:modeId" element={<QuizPlaceholderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
