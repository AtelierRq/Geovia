import { CheckCircle2, CircleAlert, LoaderCircle, RotateCcw } from 'lucide-react'
import type { QuizSaveStatus } from '../hooks/useQuizAttemptPersistence'

type Props = {
  status: QuizSaveStatus
  errorMessage: string
  onRetry: () => void
}

function QuizSaveStatusNotice({ status, errorMessage, onRetry }: Props) {
  if (status === 'idle') return null
  if (status === 'saving') return <p className="quiz-save-status pending" role="status"><LoaderCircle size={17} className="quiz-save-spinner" /> Zapisywanie wyniku na koncie…</p>
  if (status === 'saved') return <p className="quiz-save-status success" role="status"><CheckCircle2 size={17} /> Wynik zapisano na koncie.</p>
  if (status === 'saved-local') return <p className="quiz-save-status success" role="status"><CheckCircle2 size={17} /> Wynik zapisano lokalnie w tej przeglądarce.</p>

  return <div className="quiz-save-status error" role="alert">
    <CircleAlert size={17} />
    <span>Nie udało się zapisać wyniku. {errorMessage || 'Sprawdź połączenie i spróbuj ponownie.'}</span>
    <button type="button" onClick={onRetry}><RotateCcw size={15} /> Spróbuj ponownie</button>
  </div>
}

export default QuizSaveStatusNotice
