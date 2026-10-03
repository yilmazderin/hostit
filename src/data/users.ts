import type { User, Vendor } from '../types'

export const USERS: User[] = [
  {
    id: 'u-maya',
    role: 'customer',
    name: 'Maya Thompson',
    email: 'customer@hostit.com',
    password: 'hostit',
    plannerType: 'self',
  },
  {
    id: 'u-acc',
    role: 'vendor',
    name: 'Jordan — A Couple Cocktails',
    email: 'vendor@hostit.com',
    password: 'hostit',
    vendorId: 'v-a-couple-cocktails',
  },
  {
    id: 'u-pantry',
    role: 'vendor',
    name: 'Sam — The Pantry',
    email: 'pantry@hostit.com',
    password: 'hostit',
    vendorId: 'v-the-pantry',
  },
  {
    id: 'u-bloom',
    role: 'vendor',
    name: 'Priya Nair',
    email: 'apply@hostit.com',
    password: 'hostit',
    vendorId: 'v-bloom-and-barrel',
    termsAcceptedAt: '2026-09-28T15:00:00.000Z',
  },
  {
    id: 'u-admin',
    role: 'admin',
    name: 'Host It team',
    email: 'admin@hostit.com',
    password: 'hostit',
  },
]

// A business that applied through Join the Network and is waiting on review. Not public until approved.
export const SEED_APPLICANTS: Vendor[] = [
  {
    id: 'v-bloom-and-barrel',
    slug: 'bloom-and-barrel',
    name: 'Bloom & Barrel',
    categorySlug: 'styling-decor',
    tagline: 'wildflower installs and vintage bar carts.',
    location: 'Kingsville, ON',
    description:
      'seasonal, locally grown florals arranged loose and wild, plus a fleet of restored bar carts and barrel tables for cocktail hours and garden parties.',
    services: ['floral installations', 'bar cart rentals', 'barrel tables', 'table florals'],
    bestFor: ['wedding', 'shower', 'private gathering'],
    vibes: ['garden', 'rustic', 'boho'],
    guestRange: { min: 15, max: 150 },
    unavailableDates: [],
    instagram: '@bloomandbarrel',
    images: Array.from({ length: 4 }, (_, i) => `https://picsum.photos/seed/bloom-and-barrel-${i + 1}/800/600`),
    tags: ['florals', 'rentals', 'installations'],
    listing: 'pending',
    submittedAt: '2026-09-28T15:20:00.000Z',
  },
]

export const DEMO_LOGINS = [
  { label: 'planner', sub: 'Maya · plans events', email: 'customer@hostit.com', password: 'hostit' },
  { label: 'vendor', sub: 'A Couple Cocktails · in the network', email: 'vendor@hostit.com', password: 'hostit' },
  { label: 'vendor', sub: 'The Pantry · in the network', email: 'pantry@hostit.com', password: 'hostit' },
  { label: 'applicant', sub: 'Bloom & Barrel · awaiting review', email: 'apply@hostit.com', password: 'hostit' },
  { label: 'admin', sub: 'Host It team · reviews applications', email: 'admin@hostit.com', password: 'hostit' },
]
