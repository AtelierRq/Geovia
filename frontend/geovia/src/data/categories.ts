import {
  Globe2,
  Flag,
  Landmark,
  Waves,
  Droplets,
} from 'lucide-react'

export const categories = [
  {
    id: 'countries',
    title: 'Państwa',
    description: 'Poznaj państwa świata i ich położenie.',
    icon: Globe2,
    imageClass: 'countries-image',
  },
  {
    id: 'capitals',
    title: 'Stolice',
    description: 'Sprawdź znajomość stolic państw.',
    icon: Landmark,
    imageClass: 'capitals-image',
  },
  {
    id: 'flags',
    title: 'Flagi',
    description: 'Rozpoznawaj flagi państw świata.',
    icon: Flag,
    imageClass: 'flags-image',
  },
  {
    id: 'seas',
    title: 'Morza',
    description: 'Sprawdź swoją wiedzę o morzach świata.',
    icon: Waves,
    imageClass: 'seas-image',
  },
  {
    id: 'rivers',
    title: 'Rzeki',
    description: 'Poznaj największe rzeki świata.',
    icon: Droplets,
    imageClass: 'rivers-image',
  },
]
