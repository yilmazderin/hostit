import type { Category, CategorySlug } from '../types'

export const CATEGORIES: Category[] = [
  {
    slug: 'food-drink',
    name: 'food & drink',
    blurb: 'curated food, drink, and pop-up vendors for gatherings, private events, and brand moments.',
    image: 'https://picsum.photos/seed/hostit-food/900/700',
    color: 'blush',
  },
  {
    slug: 'styling-decor',
    name: 'styling & decor',
    blurb: 'florals, tablescapes, rentals, and the details that set the room.',
    image: 'https://picsum.photos/seed/hostit-decor/900/700',
    color: 'moss',
  },
  {
    slug: 'photo-moments',
    name: 'photo & moments',
    blurb: 'photographers, content creators, and moments worth keeping.',
    image: 'https://picsum.photos/seed/hostit-photo/900/700',
    color: 'sky',
  },
  {
    slug: 'entertainment',
    name: 'entertainment',
    blurb: 'djs, live music, photo booths, and everything that keeps the night going.',
    image: 'https://picsum.photos/seed/hostit-music/900/700',
    color: 'plum',
  },
  {
    slug: 'workshops-experiences',
    name: 'workshops & experiences',
    blurb: 'hands-on sessions and hosted experiences your guests will talk about.',
    image: 'https://picsum.photos/seed/hostit-workshop/900/700',
    color: 'honey',
  },
  {
    slug: 'wellness',
    name: 'wellness',
    blurb: 'movement, breath, and slow moments for retreats and mindful gatherings.',
    image: 'https://picsum.photos/seed/hostit-wellness/900/700',
    color: 'clay',
  },
  {
    slug: 'venues-spaces',
    name: 'venues & spaces',
    blurb: 'studios, patios, and rooms with character across windsor-essex.',
    image: 'https://picsum.photos/seed/hostit-venue/900/700',
    color: 'slate',
  },
]

export const categoryBySlug = (slug: CategorySlug) =>
  CATEGORIES.find((c) => c.slug === slug)!

// What vendors in each category offer: the filters on a category page and the tags on a profile.
export const CATEGORY_TAGS: Record<CategorySlug, string[]> = {
  'food-drink': ['mocktails', 'cocktails', 'mobile bar', 'coffee', 'catering', 'desserts', 'grazing'],
  'styling-decor': ['florals', 'balloons', 'lighting', 'installations', 'tablescapes', 'rentals', 'signage'],
  'photo-moments': ['wedding', 'brand', 'lifestyle', 'event', 'film', 'photo booth', 'live painting'],
  entertainment: ['dj', 'live music', 'mc & hosting', 'ceremony', 'cocktail hour', 'dinner', 'dance floor', 'games'],
  'workshops-experiences': ['art', 'crafts', 'jewellery', 'pottery', 'paint & sip', 'pop-up', 'team building'],
  wellness: ['yoga', 'pilates', 'breathwork', 'movement', 'sauna', 'retreats'],
  'venues-spaces': ['indoor', 'outdoor', 'garden', 'patio', 'loft', 'studio', 'restaurant'],
}

export const CATEGORY_BG: Record<string, string> = {
  blush: 'bg-blush',
  moss: 'bg-moss',
  sky: 'bg-sky',
  plum: 'bg-plum',
  honey: 'bg-honey',
  clay: 'bg-clay',
  slate: 'bg-slate',
  sand: 'bg-sand',
}
