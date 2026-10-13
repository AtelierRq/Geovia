import { getCountriesByContinent, normalizeCountryName, type Country } from './countries'

// Zachowujemy dotychczasowy import, żeby obecny quiz działał bez zmian.
// Lista Europy jest generowana ze wspólnego źródła danych.
export type EuropeanCountry = Country
export const europeCountries: EuropeanCountry[] = getCountriesByContinent('europe')

export { normalizeCountryName }
