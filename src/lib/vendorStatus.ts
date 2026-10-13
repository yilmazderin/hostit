import type { CategorySlug, CustomVendor, EventBoard, Inquiry, Vendor } from '../types'

// Where a pinned vendor stands for one event. 'unavailable' shares the declined group; nothing derives it
// any more (host it doesn't track vendor availability), but the type stays for the badge and older data.
export type BoardStatus = 'confirmed' | 'pending' | 'not-contacted' | 'declined' | 'unavailable'
export type StatusGroup = 'confirmed' | 'pending' | 'not-contacted' | 'declined'

export function boardStatus(inquiry?: Inquiry): BoardStatus {
  if (inquiry?.status === 'accepted') return 'confirmed'
  if (inquiry?.status === 'declined') return 'declined'
  return inquiry ? 'pending' : 'not-contacted'
}

export const groupOf = (s: BoardStatus): StatusGroup => (s === 'unavailable' ? 'declined' : s)

export const STATUS_GROUPS: { key: StatusGroup; label: string }[] = [
  { key: 'confirmed', label: 'confirmed' },
  { key: 'pending', label: 'contacted / pending' },
  { key: 'not-contacted', label: 'not contacted' },
  { key: 'declined', label: 'declined / unavailable' },
]

// the dot beside each status, in section headings and the status menu
export const STATUS_DOT: Record<StatusGroup, string> = {
  confirmed: 'bg-moss',
  pending: 'bg-honey',
  'not-contacted': 'border border-ink/30 bg-surface',
  declined: 'bg-mist-deep',
}

// pinned and still in play, but not booked
export const isConsidering = (s: BoardStatus) => s === 'pending' || s === 'not-contacted'

// Everything on an event's board, network and planner-added alike.
export type BoardItem = {
  key: string
  name: string
  categorySlug: CategorySlug
  status: BoardStatus
  group: StatusGroup
} & ({ kind: 'network'; vendor: Vendor } | { kind: 'custom'; custom: CustomVendor })

export function boardItems(
  event: EventBoard,
  vendors: Vendor[],
  inquiryFor: (eventId: string, vendorId: string) => Inquiry | undefined,
): BoardItem[] {
  const network = event.vendorIds
    .map((id) => vendors.find((v) => v.id === id))
    .filter((v): v is Vendor => !!v)
    .map<BoardItem>((vendor) => {
      // the planner's own record of the booking wins; otherwise it follows the inquiry
      const status = event.vendorStatuses?.[vendor.id] ?? boardStatus(inquiryFor(event.id, vendor.id))
      return { kind: 'network', key: vendor.id, name: vendor.name, categorySlug: vendor.categorySlug, status, group: groupOf(status), vendor }
    })
  const custom = (event.customVendors ?? []).map<BoardItem>((c) => ({
    kind: 'custom', key: c.id, name: c.name, categorySlug: c.categorySlug, status: c.status, group: groupOf(c.status), custom: c,
  }))
  return [...network, ...custom]
}

// Confirmed vendors counted against what the event needs (an extra vendor in one category doesn't fill another).
export function needsProgress(event: EventBoard, items: BoardItem[]) {
  let needed = 0
  let filled = 0
  for (const slug of event.needs) {
    const n = event.needCounts?.[slug] ?? 1
    needed += n
    filled += Math.min(n, items.filter((i) => i.categorySlug === slug && i.status === 'confirmed').length)
  }
  return { needed, filled }
}
