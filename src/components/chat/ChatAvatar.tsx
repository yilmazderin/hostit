import type { User, Vendor } from '../../types'
import { CATEGORY_BG, categoryBySlug } from '../../data/categories'
import { initials } from '../../lib/chat'

// "Jordan — A Couple Cocktails" is how a vendor's own account is named; as a planner they're just Jordan
export const plannerName = (u?: User) => u?.name.split(' — ')[0] ?? 'a planner'

// A vendor's cover photo, or their initials on their category's colour. Planners get initials on sand.
export function ChatAvatar({ vendor, planner, size = 44 }: { vendor?: Vendor; planner?: User; size?: number }) {
  const box = { width: size, height: size }
  if (vendor?.images[0]) return <img src={vendor.images[0]} alt="" style={box} className="shrink-0 rounded-full bg-mist object-cover" />
  const bg = vendor ? CATEGORY_BG[categoryBySlug(vendor.categorySlug).color] : 'bg-sand'
  return (
    <span
      aria-hidden="true"
      style={{ ...box, fontSize: Math.round(size * 0.36) }}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-ink ${bg}`}
    >
      {initials(vendor?.name ?? plannerName(planner))}
    </span>
  )
}

export function ChatIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 3.5h11v7.5H7l-3 2.5V11H2.5z" />
    </svg>
  )
}
