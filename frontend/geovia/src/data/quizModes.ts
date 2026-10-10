export type QuizMode = {
  id: string
  title: string
  description: string
  icon: 'type' | 'map-pin' | 'map' | 'flag' | 'list-check'
}

// Dostępność definiujemy osobno dla każdej kombinacji kategorii i obszaru.
// Na początek konfigurujemy pełny zestaw dla państw; kolejne kombinacje
// można dodawać bez zmieniania komponentów stron.
const countryModes: QuizMode[] = [
  {
    id: 'type-to-map',
    title: 'Wpisz państwo',
    description: 'Wpisuj nazwy państw, a poprawne odpowiedzi będą zaznaczane na mapie.',
    icon: 'type',
  },
  {
    id: 'click-and-name',
    title: 'Kliknij i nazwij państwo',
    description: 'Wybierz państwo na mapie i wpisz jego nazwę.',
    icon: 'map-pin',
  },
  {
    id: 'find-on-map',
    title: 'Znajdź państwo na mapie',
    description: 'Otrzymasz nazwę państwa i wskażesz je na mapie.',
    icon: 'map',
  },
]

export const quizModesByCategoryAndArea: Record<string, Record<string, QuizMode[]>> = {
  countries: {
    world: countryModes,
    africa: countryModes,
    asia: countryModes,
    europe: countryModes,
    'north-america': countryModes,
    'south-america': countryModes,
    oceania: countryModes,
  },
  capitals: {
    world: [
      { id: 'type-capital', title: 'Wpisz stolicę', description: 'Zobacz nazwę państwa i wpisz jego stolicę.', icon: 'type' },
      { id: 'find-city-on-map', title: 'Znajdź stolicę na mapie', description: 'Wskaż na mapie lokalizację wskazanej stolicy.', icon: 'map-pin' },
    ],
    europe: [
      { id: 'type-capital', title: 'Wpisz stolicę', description: 'Zobacz nazwę państwa i wpisz jego stolicę.', icon: 'type' },
      { id: 'find-city-on-map', title: 'Znajdź stolicę na mapie', description: 'Wskaż na mapie lokalizację wskazanej stolicy.', icon: 'map-pin' },
    ],
  },
  flags: {
    world: [
      { id: 'name-flag', title: 'Rozpoznaj flagę', description: 'Zobacz flagę i wpisz nazwę państwa.', icon: 'flag' },
      { id: 'flag-on-map', title: 'Znajdź państwo na mapie', description: 'Zobacz flagę i wskaż państwo, do którego należy.', icon: 'map' },
      { id: 'choose-flag', title: 'Wybierz właściwą flagę', description: 'Dopasuj flagę do podanej nazwy państwa.', icon: 'list-check' },
    ],
    europe: [
      { id: 'name-flag', title: 'Rozpoznaj flagę', description: 'Zobacz flagę i wpisz nazwę państwa.', icon: 'flag' },
      { id: 'flag-on-map', title: 'Znajdź państwo na mapie', description: 'Zobacz flagę i wskaż państwo, do którego należy.', icon: 'map' },
      { id: 'choose-flag', title: 'Wybierz właściwą flagę', description: 'Dopasuj flagę do podanej nazwy państwa.', icon: 'list-check' },
    ],
  },
}
