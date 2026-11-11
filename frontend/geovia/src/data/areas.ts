import { Earth, Globe2 } from 'lucide-react'

import worldImage from '../assets/area-illustrations/world.jpg'
import africaImage from '../assets/area-illustrations/africa.jpg'
import asiaImage from '../assets/area-illustrations/asia.jpg'
import europeImage from '../assets/area-illustrations/europe.jpg'
import northAmericaImage from '../assets/area-illustrations/north-america.jpg'
import southAmericaImage from '../assets/area-illustrations/south-america.jpg'
import oceaniaImage from '../assets/area-illustrations/oceania.jpg'

export const areas = [
  {
    id: 'world',
    name: 'Cały świat',
    description: 'Sprawdź swoją wiedzę z całego świata.',
    icon: Earth,
    image: worldImage,
  },
  {
    id: 'africa',
    name: 'Afryka',
    description: 'Poznaj geografię Afryki.',
    icon: Globe2,
    image: africaImage,
  },
  {
    id: 'asia',
    name: 'Azja',
    description: 'Poznaj geografię Azji.',
    icon: Globe2,
    image: asiaImage,
  },
  {
    id: 'europe',
    name: 'Europa',
    description: 'Poznaj geografię Europy.',
    icon: Globe2,
    image: europeImage,
  },
  {
    id: 'north-america',
    name: 'Ameryka Północna',
    description: 'Poznaj geografię Ameryki Północnej.',
    icon: Globe2,
    image: northAmericaImage,
  },
  {
    id: 'south-america',
    name: 'Ameryka Południowa',
    description: 'Poznaj geografię Ameryki Południowej.',
    icon: Globe2,
    image: southAmericaImage,
  },
  {
    id: 'oceania',
    name: 'Oceania',
    description: 'Poznaj geografię Oceanii.',
    icon: Globe2,
    image: oceaniaImage,
  },
]
