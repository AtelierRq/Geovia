import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import QuizCatalogPage from './pages/QuizCatalogPage'
import CategoryPage from './pages/CategoryPage'
import NotFoundPage from './pages/NotFoundPage'
import QuizModesPage from './pages/QuizModesPage'
import QuizRoute from './pages/QuizRoute'
import ProfilePage from './pages/ProfilePage'
import AccountPage from './pages/AccountPage'
import ProfileEditPage from './pages/ProfileEditPage'
import AuthPage from './pages/AuthPage'
import { UserProvider } from './context/UserContext'
import './App.css'

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quizzes" element={<QuizCatalogPage />} />
          <Route path="/categories/:categoryId" element={<CategoryPage />} />
          <Route path="/categories/:categoryId/areas/:areaId/modes" element={<QuizModesPage />} />
          <Route path="/quiz/:categoryId/:areaId/:modeId" element={<QuizRoute />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/profile/account" element={<AccountPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App
