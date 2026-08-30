export type Category = {
  id: string
  slug: string
  name: string
  image: string
  description: string
  sortOrder: number
  isActive: boolean
  filter?: string
}

export const categories: Category[] = [
  {
    id: 'budget-friendly',
    slug: 'budget-friendly',
    name: 'Budget Friendly',
    image: '/categories/budget-friendly.png',
    description: 'Everyday festive looks at approachable prices.',
    sortOrder: 1,
    isActive: true,
    filter: 'budget',
  },
  {
    id: 'aari-work-pavada-set',
    slug: 'aari-work-pavada-set',
    name: 'Aari Work Pavada Set',
    image: '/categories/aari-pavada-set.png',
    description: 'Hand-embellished pavada sets for celebrations.',
    sortOrder: 2,
    isActive: true,
    filter: 'aari-pavada-set',
  },
  {
    id: 'aari-work-frocks',
    slug: 'aari-work-frocks',
    name: 'Aari Work Frocks',
    image: '/categories/aari-frocks.png',
    description: 'Detailed aari work frocks for little ones.',
    sortOrder: 3,
    isActive: true,
    filter: 'aari-frocks',
  },
  {
    id: 'aari-work-coat-set',
    slug: 'aari-work-coat-set',
    name: 'Aari Work Coat Set',
    image: '/categories/aari-coat-set.png',
    description: 'Coat sets with delicate aari detailing.',
    sortOrder: 4,
    isActive: true,
    filter: 'aari-coat-set',
  },
  {
    id: 'ethnic-silk-frocks',
    slug: 'ethnic-silk-frocks',
    name: 'Ethnic Silk Frocks',
    image: '/categories/ethnic-silk.png',
    description: 'Soft silk frocks for festive moments.',
    sortOrder: 5,
    isActive: true,
    filter: 'ethnic-silk',
  },
  {
    id: 'kota-collection',
    slug: 'kota-collection',
    name: 'Kota Collection',
    image: '/categories/kota.png',
    description: 'Light kota weaves for warm-weather wear.',
    sortOrder: 6,
    isActive: true,
    filter: 'kota',
  },
  {
    id: 'pattu-pavada-sets',
    slug: 'pattu-pavada-sets',
    name: 'Pattu Pavada Sets',
    image: '/categories/pattu-pavada.png',
    description: 'Classic pattu pavada sets for special occasions.',
    sortOrder: 7,
    isActive: true,
    filter: 'pattu-pavada',
  },
  {
    id: 'aari-work-pavada',
    slug: 'aari-work-pavada',
    name: 'Aari Work Pavada',
    image: '/categories/aari-pavada.png',
    description: 'Standalone aari-work pavadas.',
    sortOrder: 8,
    isActive: true,
    filter: 'aari-pavada',
  },
  {
    id: 'festive-specials',
    slug: 'festive-specials',
    name: 'Festive Specials',
    image: '/categories/festive.png',
    description: 'Seasonal picks for festivals and family gatherings.',
    sortOrder: 9,
    isActive: true,
    filter: 'festive',
  },
  {
    id: 'party-wear',
    slug: 'party-wear',
    name: 'Party Wear',
    image: '/categories/party.png',
    description: 'Statement looks for birthdays and celebrations.',
    sortOrder: 10,
    isActive: true,
    filter: 'party',
  },
  {
    id: 'everyday-wear',
    slug: 'everyday-wear',
    name: 'Everyday Wear',
    image: '/categories/everyday.png',
    description: 'Comfortable ethnic pieces for daily wear.',
    sortOrder: 11,
    isActive: true,
    filter: 'everyday',
  },
  {
    id: 'new-arrivals',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    image: '/categories/new-arrivals.png',
    description: 'The latest drops from BabyPleates.',
    sortOrder: 12,
    isActive: true,
    filter: 'new',
  },
]

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}
