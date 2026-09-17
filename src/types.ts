export type Role = 'customer' | 'vendor'

export type EventType =
  | 'wedding'
  | 'shower'
  | 'birthday'
  | 'brand event'
  | 'corporate'
  | 'private gathering'
  | 'workshop'

export type VibeTag =
  | 'intimate'
  | 'elevated'
  | 'playful'
  | 'boho'
  | 'minimal'
  | 'moody'
  | 'garden'
  | 'glam'
  | 'cozy'
  | 'retro'
  | 'festive'
  | 'coastal'
  | 'rustic'
  | 'modern'

export type CategorySlug =
  | 'food-drink'
  | 'styling-decor'
  | 'photo-moments'
  | 'entertainment'
  | 'workshops-experiences'
  | 'wellness'
  | 'venues-spaces'

export interface Category {
  slug: CategorySlug
  name: string
  blurb: string
  image: string
  color: string // tailwind color token name, e.g. 'blush'
}

export interface Vendor {
  id: string
  slug: string
  name: string
  categorySlug: CategorySlug
  tagline: string
  location: string
  description: string
  services: string[]
  bestFor: EventType[]
  vibes: VibeTag[]
  guestRange: { min: number; max: number }
  unavailableDates: string[] // ISO yyyy-mm-dd
  instagram?: string
  website?: string
  images: string[]
  featured?: boolean
}

export type VendorOverride = Partial<
  Pick<
    Vendor,
    | 'tagline'
    | 'description'
    | 'services'
    | 'bestFor'
    | 'vibes'
    | 'guestRange'
    | 'unavailableDates'
    | 'instagram'
    | 'website'
    | 'images'
  >
>

export interface EventBoard {
  id: string
  ownerId: string
  name: string
  type: EventType
  guests: number
  date: string // ISO yyyy-mm-dd
  vibes: VibeTag[]
  needs: CategorySlug[]
  vendorIds: string[]
  notes: string
  cover: string // color token
  createdAt: string
}

export type InquiryStatus = 'pending' | 'accepted' | 'declined'

export interface Inquiry {
  id: string
  eventId: string
  vendorId: string
  customerId: string
  message: string
  status: InquiryStatus
  createdAt: string
}

export interface User {
  id: string
  role: Role
  name: string
  email: string
  password: string
  vendorId?: string
}

export interface Survey {
  type: EventType | null
  guests: number
  date: string
  vibes: VibeTag[]
  needs: CategorySlug[]
}

export interface MatchResult {
  vendor: Vendor
  score: number
  reasons: string[]
}
