export type ContinentId =
  | 'europe'
  | 'asia'
  | 'africa'
  | 'north-america'
  | 'south-america'
  | 'oceania'

export type Country = {
  id: string
  name: string
  aliases?: string[]
  mapId: string
  continents: ContinentId[]
}

// Jedno źródło danych państw. Państwo może być przypisane do kilku kontynentów.
export const countries: Country[] = [
  { id: 'albania', name: 'Albania', continents: ["europe"], mapId: '8' },
  { id: 'andorra', name: 'Andora', continents: ["europe"], mapId: '20' },
  { id: 'austria', name: 'Austria', continents: ["europe"], mapId: '40' },
  { id: 'belarus', name: 'Białoruś', continents: ["europe"], mapId: '112' },
  { id: 'belgium', name: 'Belgia', continents: ["europe"], mapId: '56' },
  { id: 'bosnia', name: 'Bośnia i Hercegowina', aliases: ['Bośnia'], continents: ["europe"], mapId: '70' },
  { id: 'bulgaria', name: 'Bułgaria', continents: ["europe"], mapId: '100' },
  { id: 'croatia', name: 'Chorwacja', continents: ["europe"], mapId: '191' },
  { id: 'cyprus', name: 'Cypr', continents: ["europe"], mapId: '196' },
  { id: 'czechia', name: 'Czechy', aliases: ['Republika Czeska'], continents: ["europe"], mapId: '203' },
  { id: 'denmark', name: 'Dania', continents: ["europe"], mapId: '208' },
  { id: 'estonia', name: 'Estonia', continents: ["europe"], mapId: '233' },
  { id: 'finland', name: 'Finlandia', continents: ["europe"], mapId: '246' },
  { id: 'france', name: 'Francja', continents: ["europe"], mapId: '250' },
  { id: 'germany', name: 'Niemcy', continents: ["europe"], mapId: '276' },
  { id: 'greece', name: 'Grecja', continents: ["europe"], mapId: '300' },
  { id: 'hungary', name: 'Węgry', continents: ["europe"], mapId: '348' },
  { id: 'iceland', name: 'Islandia', continents: ["europe"], mapId: '352' },
  { id: 'ireland', name: 'Irlandia', continents: ["europe"], mapId: '372' },
  { id: 'italy', name: 'Włochy', continents: ["europe"], mapId: '380' },
  { id: 'kazakhstan', name: 'Kazachstan', continents: ["europe", "asia"], mapId: '398' },
  { id: 'kosovo', name: 'Kosowo', continents: ["europe"], mapId: '383' },
  { id: 'latvia', name: 'Łotwa', continents: ["europe"], mapId: '428' },
  { id: 'liechtenstein', name: 'Liechtenstein', continents: ["europe"], mapId: '438' },
  { id: 'lithuania', name: 'Litwa', continents: ["europe"], mapId: '440' },
  { id: 'luxembourg', name: 'Luksemburg', continents: ["europe"], mapId: '442' },
  { id: 'malta', name: 'Malta', continents: ["europe"], mapId: '470' },
  { id: 'moldova', name: 'Mołdawia', aliases: ['Republika Mołdawii'], continents: ["europe"], mapId: '498' },
  { id: 'monaco', name: 'Monako', continents: ["europe"], mapId: '492' },
  { id: 'montenegro', name: 'Czarnogóra', continents: ["europe"], mapId: '499' },
  { id: 'netherlands', name: 'Holandia', aliases: ['Niderlandy'], continents: ["europe"], mapId: '528' },
  { id: 'north-macedonia', name: 'Macedonia Północna', aliases: ['Macedonia'], continents: ["europe"], mapId: '807' },
  { id: 'norway', name: 'Norwegia', continents: ["europe"], mapId: '578' },
  { id: 'poland', name: 'Polska', continents: ["europe"], mapId: '616' },
  { id: 'portugal', name: 'Portugalia', continents: ["europe"], mapId: '620' },
  { id: 'romania', name: 'Rumunia', continents: ["europe"], mapId: '642' },
  { id: 'russia', name: 'Rosja', continents: ["europe", "asia"], mapId: '643' },
  { id: 'san-marino', name: 'San Marino', continents: ["europe"], mapId: '674' },
  { id: 'serbia', name: 'Serbia', continents: ["europe"], mapId: '688' },
  { id: 'slovakia', name: 'Słowacja', continents: ["europe"], mapId: '703' },
  { id: 'slovenia', name: 'Słowenia', continents: ["europe"], mapId: '705' },
  { id: 'spain', name: 'Hiszpania', continents: ["europe"], mapId: '724' },
  { id: 'sweden', name: 'Szwecja', continents: ["europe"], mapId: '752' },
  { id: 'switzerland', name: 'Szwajcaria', continents: ["europe"], mapId: '756' },
  { id: 'turkey', name: 'Turcja', continents: ["europe", "asia"], mapId: '792' },
  { id: 'ukraine', name: 'Ukraina', continents: ["europe"], mapId: '804' },
  { id: 'united-kingdom', name: 'Wielka Brytania', aliases: ['Zjednoczone Królestwo', 'Anglia'], continents: ["europe"], mapId: '826' },
  { id: 'vatican', name: 'Watykan', aliases: ['Państwo Watykańskie'], continents: ["europe"], mapId: '336' },
]

export function normalizeCountryName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[łŁ]/g, 'l')
    .replace(/[^a-z0-9]/g, '')
}

export function getCountriesByContinent(continentId: ContinentId) {
  return countries.filter((country) => country.continents.includes(continentId))
}
