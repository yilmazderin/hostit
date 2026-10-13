export type Role = 'customer' | 'vendor' | 'admin'

// What a planner told us at sign-up. V1 treats them the same; stored so tiers can follow.
export type PlannerType = 'self' | 'business' | 'professional'

// A vendor record's place in the curated network. Seeded vendors have no listing field: they're approved.
// draft → pending → (needs-info ↔ pending) → approved (host it prepares the profile) → live. Or rejected.
// Seeded vendors have no listing field: they're live.
export type ListingStatus = 'draft' | 'pending' | 'needs-info' | 'approved' | 'live' | 'rejected'

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
  tags?: string[] // category-specific offerings used for filtering, e.g. 'mobile bar', 'wedding'
  listing?: ListingStatus // absent means live
  submittedAt?: string
  submission?: VendorSubmission
  review?: { decidedAt: string; note?: string }
  publishedAt?: string
}

// What the vendor sent for review, frozen at submit time. Host It's later edits change the listing, not this.
export type VendorSubmission = Pick<
  Vendor,
  'name' | 'categorySlug' | 'location' | 'tagline' | 'description' | 'services' | 'bestFor' | 'vibes' | 'guestRange' | 'instagram' | 'website' | 'images' | 'tags'
>

// A live vendor asking Host It to change their public listing (vendors can't edit it directly).
export interface ChangeRequest {
  id: string
  vendorId: string
  userId: string
  message: string
  createdAt: string
  status: 'open' | 'resolved'
  resolvedAt?: string
  reply?: string
}

// Single-use password reset link. The POC has no mail server, so the "email" is shown in a demo inbox.
export interface ResetToken {
  token: string
  userId: string
  createdAt: string
  expiresAt: string
  usedAt?: string
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
    | 'name'
    | 'categorySlug'
    | 'location'
    | 'tags'
    | 'listing'
    | 'submittedAt'
    | 'submission'
    | 'publishedAt'
    | 'review'
  >
>

// Statuses a planner sets by hand on a vendor they brought themselves (no inquiry flow for those).
export type ManualStatus = 'not-contacted' | 'pending' | 'confirmed' | 'declined'

// A vendor outside the Host It network, added by the planner. Private to one event.
export interface CustomVendor {
  id: string
  name: string
  categorySlug: CategorySlug
  status: ManualStatus
  contactName?: string
  contact?: string // email or phone
  link?: string // website or instagram
  notes?: string
  createdAt: string
}

export interface Task {
  id: string
  text: string
  done: boolean
}

export interface StickyNote {
  id: string
  text: string
  color: string // color token
}

export interface EventBoard {
  id: string
  ownerId: string
  name: string
  type: EventType
  guests: number
  date: string // ISO yyyy-mm-dd
  time?: string // 24h HH:mm
  location?: string
  vibes: VibeTag[]
  needs: CategorySlug[]
  needCounts?: Partial<Record<CategorySlug, number>> // how many vendors each need calls for; missing = 1
  vendorIds: string[]
  customVendors?: CustomVendor[]
  tasks?: Task[]
  stickies?: StickyNote[]
  resultsBasis?: string // surveyKey of the event when its matched results were last viewed
  vendorStatuses?: Partial<Record<string, ManualStatus>> // the planner's own status for a Host It vendor; wins over the inquiry
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
  plannerType?: PlannerType
  termsAcceptedAt?: string
  createdAt?: string
  lastDashboard?: 'planning' | 'vendor' // where log in returns them
}

// A chat between a planner and a Host It vendor: one per pair, however many events they talk about.
// The event is the one it was last about, shown as context. Each side's read mark drives unread counts.
export interface Conversation {
  id: string
  plannerId: string
  vendorId: string
  eventId?: string
  createdAt: string
  updatedAt: string
  plannerReadAt?: string
  vendorReadAt?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  from: 'planner' | 'vendor'
  senderId?: string // the account that wrote it; absent for a demo auto-reply
  text: string
  createdAt: string
  auto?: boolean // the POC's stand-in reply from a vendor with no account
}

// In-app messages, e.g. a vendor hearing back about their application.
export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  to?: string // where "view" goes
  createdAt: string
  read: boolean
}

export interface Survey {
  type: EventType | null
  guests: number
  date: string
  time?: string // saved to the event; never used to filter vendors
  vibes: VibeTag[]
  needs: CategorySlug[]
}

export interface MatchResult {
  vendor: Vendor
  score: number
  reasons: string[]
}
