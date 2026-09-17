import type { User } from '../types'

export const USERS: User[] = [
  {
    id: 'u-maya',
    role: 'customer',
    name: 'Maya Thompson',
    email: 'customer@hostit.com',
    password: 'hostit',
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
]

export const DEMO_LOGINS = [
  { label: 'customer', sub: 'Maya · plans events', email: 'customer@hostit.com', password: 'hostit' },
  { label: 'vendor', sub: 'A Couple Cocktails', email: 'vendor@hostit.com', password: 'hostit' },
  { label: 'vendor', sub: 'The Pantry', email: 'pantry@hostit.com', password: 'hostit' },
]
