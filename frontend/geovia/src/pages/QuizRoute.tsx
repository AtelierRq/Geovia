import { useParams } from 'react-router-dom'
import { quizModesByCategoryAndArea } from '../data/quizModes'
import QuizPlaceholderPage from './QuizPlaceholderPage'
import TypeCountryToMapPage from './TypeCountryToMapPage'

// Only implemented combinations open the interactive map quiz. All other
// existing and future combinations keep the established placeholder screen.
function QuizRoute() {
  const { categoryId, areaId, modeId } = useParams()
  const modeExists = quizModesByCategoryAndArea[categoryId ?? '']?.[areaId ?? '']?.some((mode) => mode.id === modeId)
  const implemented = categoryId === 'countries'
    && (areaId === 'world' || areaId === 'europe')
    && modeId === 'type-to-map'
    && modeExists

  return implemented ? <TypeCountryToMapPage /> : <QuizPlaceholderPage />
}

export default QuizRoute
