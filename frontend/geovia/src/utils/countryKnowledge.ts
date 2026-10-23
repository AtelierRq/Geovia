import { capitals } from '../data/capitals'
import { countries, type Country } from '../data/countries'

export type KnowledgeElement = 'name' | 'capital' | 'flag'
export type KnowledgeStatus = 'unknown' | 'learning' | 'needs-work' | 'mastered'
export type CountryMapStatus = 'unknown' | 'needs-work' | 'learning' | 'mastered'

export type SavedQuizResult = {
  id?: string
  categoryId?: string
  areaId?: string
  modeId?: string
  completed?: number
  total?: number
  percentage?: number
  elapsedSeconds?: number
  endedAt?: string
  status?: 'completed' | 'ended-early' | string
  foundCountries?: string[]
}

export type CountryKnowledge = {
  countryId: string
  name: KnowledgeStatus
  capital: KnowledgeStatus
  flag: KnowledgeStatus
  overall: CountryMapStatus
  evidence: {
    name: number
    capital: number
    flag: number
  }
}

const RESULT_KEY = 'geovia.quizResults'
const AREA_CONTINENTS: Record<string, Country['continents'][number]> = {
  europe: 'europe',
  africa: 'africa',
  asia: 'asia',
  'north-america': 'north-america',
  'south-america': 'south-america',
  oceania: 'oceania',
}

function readSavedResults(): SavedQuizResult[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(RESULT_KEY) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function countriesInArea(areaId: string | undefined): Country[] {
  if (!areaId || areaId === 'world') return countries
  const continent = AREA_CONTINENTS[areaId]
  return continent ? countries.filter((country) => country.continents.includes(continent)) : []
}

function statusFromOutcomes(outcomes: boolean[]): KnowledgeStatus {
  if (outcomes.length < 3) return 'unknown'

  const lastThree = outcomes.slice(-3)
  const correct = lastThree.filter(Boolean).length

  if (correct === 3) return 'mastered'
  if (correct === 0) return 'needs-work'
  return 'learning'
}

/**
 * Calculates knowledge from saved quiz runs only.
 * A saved run contributes one outcome per country in its scope:
 * foundCountries are correct; all other in-scope countries are incorrect.
 * Unimplemented quiz categories (such as flags) remain unknown.
 */
export function calculateCountryKnowledge(
  results: SavedQuizResult[] = readSavedResults(),
): CountryKnowledge[] {
  const orderedResults = [...results].filter((result) => {
    return (
      (result.categoryId === 'countries' || result.categoryId === 'capitals') &&
      typeof result.endedAt === 'string' &&
      !Number.isNaN(new Date(result.endedAt).getTime())
    )
  }).sort((a, b) => {
    return new Date(a.endedAt!).getTime() - new Date(b.endedAt!).getTime()
  })

  const outcomes = new Map<string, { name: boolean[]; capital: boolean[] }>()

  for (const country of countries) {
    outcomes.set(country.id, { name: [], capital: [] })
  }

  for (const result of orderedResults) {
    const element = result.categoryId === 'countries' ? 'name' : 'capital'
    const scope = countriesInArea(result.areaId)
    const found = new Set(
      (result.foundCountries ?? []).filter((id): id is string => typeof id === 'string'),
    )

    for (const country of scope) {
      const countryOutcomes = outcomes.get(country.id)
      if (countryOutcomes) countryOutcomes[element].push(found.has(country.id))
    }
  }

  return countries.map((country) => {
    const countryOutcomes = outcomes.get(country.id) ?? { name: [], capital: [] }
    const name = statusFromOutcomes(countryOutcomes.name)
    const capital = capitals.some((item) => item.countryId === country.id)
      ? statusFromOutcomes(countryOutcomes.capital)
      : 'unknown'
    const flag: KnowledgeStatus = 'unknown'
    const elements = [name, capital, flag]

    let overall: CountryMapStatus
    if (elements.every((status) => status === 'unknown')) {
      overall = 'unknown'
    } else if (elements.every((status) => status === 'mastered')) {
      overall = 'mastered'
    } else if (elements.some((status) => status === 'mastered')) {
      overall = 'learning'
    } else {
      overall = 'needs-work'
    }

    return {
      countryId: country.id,
      name,
      capital,
      flag,
      overall,
      evidence: {
        name: countryOutcomes.name.length,
        capital: countryOutcomes.capital.length,
        flag: 0,
      },
    }
  })
}

export function getCountryKnowledgeStatusLabel(status: KnowledgeStatus | CountryMapStatus): string {
  const labels: Record<KnowledgeStatus | CountryMapStatus, string> = {
    unknown: 'Brak danych',
    'needs-work': 'Do nauki',
    learning: 'W trakcie nauki',
    mastered: 'Opanowane',
  }

  return labels[status]
}
