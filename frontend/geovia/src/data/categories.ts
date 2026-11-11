import {
  Globe2,
  Flag,
  Landmark,
  Waves,
  Droplets,
  Building2,
  Mountain,
  Compass,
  ShieldQuestion,
} from 'lucide-react'
import countriesImage from '../assets/category-illustrations/countries.jpg'
import capitalsImage from '../assets/category-illustrations/capitals.jpg'
import flagsImage from '../assets/category-illustrations/flags.jpg'
import citiesImage from '../assets/category-illustrations/cities.jpg'
import seasImage from '../assets/category-illustrations/seas.jpg'
import riversImage from '../assets/category-illustrations/rivers.jpg'
import islandsImage from '../assets/category-illustrations/islands.jpg'
import dependentTerritoriesImage from '../assets/category-illustrations/dependent-territories.jpg'
import unrecognizedStatesImage from '../assets/category-illustrations/unrecognized-states.jpg'

export const categories = [
  {
    id: 'countries',
    title: 'Państwa',
    description: 'Poznaj państwa świata i ich położenie.',
    icon: Globe2,
    image: countriesImage,
  },
  {
    id: 'capitals',
    title: 'Stolice',
    description: 'Sprawdź znajomość stolic państw.',
    icon: Landmark,
    image: capitalsImage,
  },
  {
    id: 'flags',
    title: 'Flagi',
    description: 'Rozpoznawaj flagi państw świata.',
    icon: Flag,
    image: flagsImage,
  },
  {
    id: 'cities',
    title: 'Miasta',
    description: 'Poznaj największe miasta świata.',
    icon: Building2,
    image: citiesImage,
  },
  {
    id: 'seas',
    title: 'Morza',
    description: 'Sprawdź swoją wiedzę o morzach świata.',
    icon: Waves,
    image: seasImage,
  },
  {
    id: 'rivers',
    title: 'Rzeki',
    description: 'Poznaj największe rzeki świata.',
    icon: Droplets,
    image: riversImage,
  },
  {
    id: 'islands',
    title: 'Wyspy',
    description: 'Poznaj największe wyspy świata.',
    icon: Mountain,
    image: islandsImage,
  },
  {
    id: 'dependent-territories',
    title: 'Terytoria zależne',
    description: 'Poznaj terytoria zależne na świecie.',
    icon: Compass,
    image: dependentTerritoriesImage,
  },
  {
    id: 'unrecognized-states',
    title: 'Państwa nieuznawane',
    description: 'Poznaj państwa i terytoria o spornym statusie międzynarodowym.',
    icon: ShieldQuestion,
    image: unrecognizedStatesImage,
  },
]
