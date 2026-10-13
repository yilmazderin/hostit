import type { ListingStatus, User, Vendor } from '../types'

// One account, two experiences: every account can plan; the vendor portal comes with a vendor application.
// Host It staff (admin) review and publish listings and don't plan events.
export const canPlan = (u: User | null | undefined) => !!u && u.role !== 'admin'
export const hasVendorPortal = (u: User | null | undefined) => !!u?.vendorId

export const listingOf = (v: Vendor): ListingStatus => v.listing ?? 'live'

// A vendor can change their application only before submitting, or when Host It asks for more information.
export const vendorCanEdit = (v: Vendor) => listingOf(v) === 'draft' || listingOf(v) === 'needs-info'
