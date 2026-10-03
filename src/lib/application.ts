import type { ListingStatus, Vendor } from '../types'

export const listingOf = (v: Vendor): ListingStatus => v.listing ?? 'approved'

export const LISTING_LABEL: Record<ListingStatus, string> = {
  draft: 'application in progress',
  pending: 'under review',
  approved: 'in the network',
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
