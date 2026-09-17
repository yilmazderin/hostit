import { Link } from 'react-router-dom'
import type { Category, EventBoard, Vendor } from '../types'
import { CATEGORY_BG, categoryBySlug } from '../data/categories'
import { formatDate, plural } from '../lib/format'
import { Chip } from './ui'

export function CategoryCard({ category, count }: { category: Category; count: number }) {
  return (
    <Link to={`/explore/${category.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-mist">
        <img
          src={category.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-paper">
          <div className="text-lg font-bold lowercase leading-tight">{category.name}</div>
          <div className="label-caps mt-1 opacity-70">{plural(count, 'vendor')}</div>
        </div>
      </div>
    </Link>
  )
}

export function VendorCard({
  vendor,
  to,
  onOpen,
  footer,
  selected,
  onToggle,
}: {
  vendor: Vendor
  to?: string
  onOpen?: () => void
  footer?: React.ReactNode
  selected?: boolean
  onToggle?: () => void
}) {
  const cat = categoryBySlug(vendor.categorySlug)
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-mist">
        <img src={vendor.images[0]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold lowercase text-ink ${CATEGORY_BG[cat.color]}`}>
          {cat.name}
        </span>
        {vendor.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">
            host it pick
          </span>
        )}
        {onToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggle()
            }}
            aria-pressed={selected}
            className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
              selected ? 'border-ink bg-ink text-paper' : 'border-paper bg-paper/80 text-transparent hover:text-stone'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 8.5l3 3 7-7" /></svg>
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="font-semibold leading-tight">{vendor.name}</div>
        <div className="mt-1 text-sm text-stone">{vendor.tagline}</div>
        {footer ?? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vendor.bestFor.slice(0, 3).map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        )}
      </div>
    </>
  )
  const cls = `card group block overflow-hidden text-left transition-shadow hover:shadow-[0_16px_40px_-16px_rgba(48,44,44,0.35)] ${
    selected ? 'ring-2 ring-ink' : ''
  }`
  if (onOpen) return <button type="button" onClick={onOpen} className={`${cls} w-full`}>{body}</button>
  return <Link to={to ?? `/vendors/${vendor.slug}`} className={cls}>{body}</Link>
}

export function BoardCard({ event, vendors }: { event: EventBoard; vendors: Vendor[] }) {
  const pinned = event.vendorIds.map((id) => vendors.find((v) => v.id === id)).filter(Boolean) as Vendor[]
  const imgs = pinned.slice(0, 4).map((v) => v.images[0])
  return (
    <Link to={`/events/${event.id}`} className="card group block overflow-hidden">
      <div className={`relative grid aspect-[4/3] grid-cols-2 gap-0.5 overflow-hidden ${CATEGORY_BG[event.cover] ?? 'bg-sand'}`}>
        {imgs.length === 0 && (
          <div className="col-span-2 flex items-center justify-center text-ink/50">
            <span className="label-caps">no vendors yet</span>
          </div>
        )}
        {imgs.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" className={`h-full w-full object-cover ${imgs.length === 1 ? 'col-span-2' : ''} ${imgs.length === 3 && i === 0 ? 'row-span-2' : ''}`} />
        ))}
      </div>
      <div className="p-4">
        <div className="text-lg font-bold lowercase leading-tight">{event.name}</div>
        <div className="mt-1 text-xs text-stone">
          {event.type} · {formatDate(event.date)} · {plural(event.guests, 'guest')}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="label-caps text-stone">{plural(pinned.length, 'vendor')}</span>
          <div className="flex -space-x-2">
            {pinned.slice(0, 5).map((v) => (
              <img key={v.id} src={v.images[1]} alt="" className="h-6 w-6 rounded-full border-2 border-white object-cover" />
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
