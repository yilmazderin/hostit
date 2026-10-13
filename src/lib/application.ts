import type { CategorySlug, EventType, ListingStatus, Vendor, VendorSubmission, VibeTag } from '../types'
import { CATEGORY_TAGS } from '../data/categories'
import { formatDate } from './format'

export { listingOf } from './access'

export const LISTING_LABEL: Record<ListingStatus, string> = {
  draft: 'application in progress',
  pending: 'submitted · under review',
  'needs-info': 'additional information required',
  approved: 'approved · profile being prepared',
  live: 'live · published',
  rejected: 'not approved',
}

// What an application needs before it can go to review. Shared by the vendor's checklist and the review screen.
export function applicationChecklist(v: Vendor) {
  return [
    { key: 'basics', label: 'business name, category and location', done: !!v.name.trim() && !!v.location.trim(), optional: false },
    { key: 'story', label: 'a tagline and a description (40+ characters)', done: !!v.tagline.trim() && v.description.trim().length >= 40, optional: false },
    { key: 'services', label: 'your services and the events you suit', done: v.services.length > 0 && v.bestFor.length > 0, optional: false },
    { key: 'photos', label: 'at least 3 photos of your work', done: v.images.length >= 3, optional: false },
    { key: 'links', label: 'instagram or website', done: !!(v.instagram || v.website), optional: true },
  ]
}

export const readyToSubmit = (v: Vendor) => applicationChecklist(v).every((i) => i.optional || i.done)

export const day = (iso?: string) => (iso ? formatDate(iso.slice(0, 10)) : '')

// What the vendor sent in, when there is a frozen copy; otherwise the record as it stands.
export const submittedView = (v: Vendor): Vendor => (v.submission ? { ...v, ...v.submission } : v)

// The profile form's working copy: services as typed (comma separated), guests as two numbers.
export interface ProfileDraft {
  name: string
  categorySlug: CategorySlug
  location: string
  tagline: string
  description: string
  services: string
  tags: string[]
  bestFor: EventType[]
  vibes: VibeTag[]
  min: number
  max: number
  instagram: string
  website: string
  images: string[]
}

export const draftOf = (v: Vendor): ProfileDraft => ({
  name: v.name,
  categorySlug: v.categorySlug,
  location: v.location,
  tagline: v.tagline,
  description: v.description,
  services: v.services.join(', '),
  tags: v.tags ?? [],
  bestFor: v.bestFor,
  vibes: v.vibes,
  min: v.guestRange.min,
  max: v.guestRange.max,
  instagram: v.instagram ?? '',
  website: v.website ?? '',
  images: v.images,
})

// The editable profile fields a draft saves to the record.
export const draftFields = (v: Vendor, d: ProfileDraft): VendorSubmission => ({
  name: d.name.trim() || v.name,
  categorySlug: d.categorySlug,
  location: d.location,
  tagline: d.tagline,
  description: d.description,
  services: d.services.split(',').map((s) => s.trim()).filter(Boolean),
  // only tags that belong to the (possibly changed) category survive
  tags: d.tags.filter((t) => CATEGORY_TAGS[d.categorySlug].includes(t)),
  bestFor: d.bestFor,
  vibes: d.vibes,
  guestRange: { min: d.min, max: d.max },
  // empty, not undefined: undefined is dropped from saved overrides, so a seeded vendor's old link would come back on reload
  instagram: d.instagram.trim(),
  website: d.website.trim(),
  images: d.images,
})

export const applyDraft = (v: Vendor, d: ProfileDraft): Vendor => ({ ...v, ...draftFields(v, d) })
