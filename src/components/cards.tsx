import { Link } from 'react-router-dom'
import type { Category, EventBoard, ManualStatus, Vendor } from '../types'
import { CATEGORY_BG, categoryBySlug } from '../data/categories'
import { countdown } from '../lib/events'
import { formatDate, formatTime, plural } from '../lib/format'
import { STATUS_GROUPS, boardItems, isConsidering, needsProgress, type BoardItem } from '../lib/vendorStatus'
import { useApp } from '../store/AppContext'
import { FavouriteButton } from './network/FavouriteButton'
import { Chip, StatusBadge } from './ui'

// The photo leads; name and blurb sit beneath it, never on it. The page sets the grid span and image shape.
export function CategoryCard({
  category,
  index,
  className = '',
  imageClass = 'aspect-[4/5]',
}: {
  category: Category
  index?: number
  className?: string
  imageClass?: string
}) {
  return (
    <Link to={`/network/${category.slug}`} className={`group block ${className}`}>
      <div className={`relative overflow-hidden rounded-3xl ${CATEGORY_BG[category.color]} ${imageClass}`}>
        <img
          src={category.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {index !== undefined && <div className="label-caps text-stone">{String(index + 1).padStart(2, '0')}</div>}
          <h3 className="mt-1.5 text-2xl leading-tight md:text-3xl">{category.name}</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-stone">{category.blurb}</p>
        </div>
        <span
          aria-hidden="true"
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
        </span>
      </div>
    </Link>
  )
}

export function VendorCard({
  vendor,
  to,
  onOpen,
  footer,
  flag,
  selected,
  onToggle,
}: {
  vendor: Vendor
  to?: string
  onOpen?: () => void
  footer?: React.ReactNode
  flag?: string
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
        <FavouriteButton vendor={vendor} className="absolute right-3 top-3" />
        {flag && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper">{flag}</span>
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
        <div className="truncate font-semibold leading-tight">{vendor.name}</div>
        <div className="mt-1 line-clamp-2 h-10 text-sm text-stone">{vendor.tagline}</div>
        {footer ?? (
          <div className="mt-3 flex h-[26px] flex-wrap gap-1.5 overflow-hidden">
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
  // a div with button semantics, because the select toggle inside is itself a button
  if (onOpen)
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onOpen()
          }
        }}
        className={`${cls} w-full cursor-pointer`}
      >
        {body}
      </div>
    )
  return <Link to={to ?? `/vendors/${vendor.slug}`} className={cls}>{body}</Link>
}

// A vendor on an event board. Network and planner-added vendors share one footprint; the corner
// label and the placeholder image are what tell them apart.
export function BoardVendorCard({
  item,
  eventId,
  onContact,
  onRemove,
  onEdit,
  onStatus,
}: {
  item: BoardItem
  eventId: string
  onContact: () => void
  onRemove: () => void
  onEdit: () => void
  onStatus: (status: ManualStatus) => void
}) {
  const cat = categoryBySlug(item.categorySlug)
  const out = item.group === 'declined'
  const to = item.kind === 'network' ? `/vendors/${item.vendor.slug}?event=${eventId}` : undefined
  const sub =
    item.kind === 'network'
      ? item.vendor.tagline
      : [item.custom.contactName, item.custom.contact].filter(Boolean).join(' · ') || item.custom.link || 'no contact details yet'
  const image =
    item.kind === 'network' ? (
      <img
        src={item.vendor.images[0]}
        alt=""
        loading="lazy"
        className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${out ? 'opacity-60 grayscale' : ''}`}
      />
    ) : (
      <div className={`flex h-full w-full items-center justify-center ${CATEGORY_BG[cat.color]} ${out ? 'opacity-60 grayscale' : ''}`}>
        <span className="text-5xl font-bold tracking-tight text-ink/70">{initials(item.name)}</span>
      </div>
    )
  return (
    <div className={`card group flex flex-col overflow-hidden ${item.status === 'confirmed' ? 'ring-2 ring-moss' : ''}`}>
      <div className="relative">
        {to ? (
          <Link to={to} className="block aspect-[4/3] overflow-hidden bg-mist">{image}</Link>
        ) : (
          <button onClick={onEdit} className="block aspect-[4/3] w-full overflow-hidden" aria-label={`edit ${item.name}`}>{image}</button>
        )}
        {item.kind === 'custom' ? (
          <label className="absolute left-3 top-3 cursor-pointer rounded-full bg-paper" title="change status">
            <StatusBadge status={item.status} chevron />
            <select
              aria-label={`status for ${item.name}`}
              value={item.custom.status}
              onChange={(e) => onStatus(e.target.value as ManualStatus)}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              {STATUS_GROUPS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
            </select>
          </label>
        ) : (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-paper">
            <StatusBadge status={item.status} />
          </span>
        )}
        <button
          onClick={onRemove}
          className="absolute right-3 top-3 rounded-full bg-paper/90 p-1.5 text-stone transition-colors hover:bg-paper hover:text-ink"
          aria-label={`remove ${item.name} from this board`}
          title="remove from board"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
        <span
          className={`pointer-events-none absolute bottom-3 left-3 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
            item.kind === 'network' ? 'bg-ink/85 text-paper' : 'border border-dashed border-ink/40 bg-paper/90 text-ink'
          }`}
        >
          {item.kind === 'network' ? 'host it network' : 'added by you'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {to ? (
          <Link to={to} className="truncate font-semibold leading-tight hover:underline">{item.name}</Link>
        ) : (
          <div className="truncate font-semibold leading-tight">{item.name}</div>
        )}
        <div className="mt-1 truncate text-xs text-stone">{sub}</div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className={`min-w-0 truncate rounded-full px-2.5 py-0.5 text-[10px] font-semibold lowercase ${CATEGORY_BG[cat.color]}`}>{cat.name}</span>
          {item.kind === 'network' && item.status === 'not-contacted' && (
            <button onClick={onContact} className="shrink-0 text-xs font-semibold underline decoration-ink/30 underline-offset-2 hover:decoration-ink">
              send inquiry
            </button>
          )}
          {item.kind === 'custom' && (
            <div className="flex shrink-0 items-center gap-3 text-xs">
              {item.custom.link && (
                <a href={externalUrl(item.custom.link)} target="_blank" rel="noreferrer" className="text-stone hover:text-ink" aria-label={`open ${item.custom.link}`} title={item.custom.link}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" /></svg>
                </a>
              )}
              <button onClick={onEdit} className="font-semibold underline decoration-ink/30 underline-offset-2 hover:decoration-ink">edit</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const initials = (name: string) =>
  name
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'

// '@handle' is an instagram handle; anything without a scheme gets https
export function externalUrl(link: string) {
  const l = link.trim()
  if (l.startsWith('@')) return `https://instagram.com/${l.slice(1)}`
  return /^https?:\/\//i.test(l) ? l : `https://${l}`
}

// Vendor photos from an event's board, tiled; the event's colour when there are none yet.
function BoardCover({ event, items, muted, className }: { event: EventBoard; items: BoardItem[]; muted?: boolean; className: string }) {
  const imgs = items.flatMap((i) => (i.kind === 'network' ? [i.vendor.images[0]] : [])).slice(0, 4)
  return (
    <div className={`relative grid grid-cols-2 gap-0.5 overflow-hidden ${CATEGORY_BG[event.cover] ?? 'bg-sand'} ${className}`}>
      {imgs.length === 0 && (
        <div className="col-span-2 flex items-center justify-center text-ink/50">
          <span className="label-caps">no vendors yet</span>
        </div>
      )}
      {imgs.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          className={`h-full w-full object-cover ${muted ? 'grayscale' : ''} ${imgs.length === 1 ? 'col-span-2' : ''} ${imgs.length === 3 && i === 0 ? 'row-span-2' : ''}`}
        />
      ))}
    </div>
  )
}

function ProgressLine({ filled, needed }: { filled: number; needed: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-mist">
      <div className={`h-full rounded-full ${filled >= needed ? 'bg-moss' : 'bg-ink'}`} style={{ width: `${needed ? Math.min(filled / needed, 1) * 100 : 0}%` }} />
    </div>
  )
}

export function BoardCard({ event, past }: { event: EventBoard; past?: boolean }) {
  const { vendors, inquiryFor } = useApp()
  const items = boardItems(event, vendors, inquiryFor)
  const { filled, needed } = needsProgress(event, items)
  return (
    <Link to={`/events/${event.id}`} className={`card group block overflow-hidden transition-opacity ${past ? 'opacity-75 hover:opacity-100' : ''}`}>
      <BoardCover event={event} items={items} muted={past} className="aspect-[4/3]" />
      <div className="p-4">
        <div className="truncate text-lg font-bold lowercase leading-tight">{event.name}</div>
        <div className="mt-1 truncate text-xs text-stone">
          {event.type} · {formatDate(event.date)} · {plural(event.guests, 'guest')}
        </div>
        {past ? (
          <div className="label-caps mt-3 text-stone">{plural(items.length, 'vendor')} · wrapped</div>
        ) : (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span>{needed ? `${filled} of ${needed} booked` : plural(items.length, 'vendor')}</span>
              <span className="text-stone">{countdown(event.date)}</span>
            </div>
            {needed > 0 && <ProgressLine filled={filled} needed={needed} />}
          </div>
        )}
      </div>
    </Link>
  )
}

// The next event on the calendar, given the room to show where planning stands.
export function FeaturedEventCard({ event }: { event: EventBoard }) {
  const { vendors, inquiryFor } = useApp()
  const items = boardItems(event, vendors, inquiryFor)
  const { filled, needed } = needsProgress(event, items)
  const tasksLeft = (event.tasks ?? []).filter((t) => !t.done).length
  const considering = items.filter((i) => isConsidering(i.status)).length
  const details = [formatDate(event.date), event.time && formatTime(event.time), event.location, plural(event.guests, 'guest')].filter(Boolean)
  return (
    <Link to={`/events/${event.id}`} className="card group grid overflow-hidden md:grid-cols-[1.1fr_1fr]">
      <BoardCover event={event} items={items} className="aspect-[16/10] md:aspect-auto md:min-h-80" />
      <div className="flex flex-col p-6 md:p-8">
        <span className="label-caps text-stone">up next · {countdown(event.date)}</span>
        <h3 className="mt-3 text-3xl md:text-4xl">{event.name}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold lowercase text-paper">{event.type}</span>
          {details.map((d, i) => (
            <span key={i} className="flex items-center gap-2">
              <span aria-hidden="true" className="opacity-40">·</span>
              {d}
            </span>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span><span className="font-semibold">{filled} of {needed}</span> booked</span>
            <span className="text-xs text-stone">{considering} considering</span>
          </div>
          <ProgressLine filled={filled} needed={needed} />
          {tasksLeft > 0 && <div className="text-xs text-stone">{plural(tasksLeft, 'to-do')} left</div>}
        </div>
        <div className="mt-auto pt-6">
          <span className="pill-dark">open board →</span>
        </div>
      </div>
    </Link>
  )
}
