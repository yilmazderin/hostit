import { useState, type ReactNode } from 'react'
import type { EventType, Vendor } from '../types'
import { CATEGORY_BG, categoryBySlug } from '../data/categories'
import { externalUrl } from './cards'
import { Chip } from './ui'

// how a best-for reads as a highlight on a profile
const BEST_FOR: Record<EventType, string> = {
  wedding: 'weddings',
  shower: 'showers',
  birthday: 'birthdays',
  'brand event': 'brand events',
  corporate: 'corporate events',
  'private gathering': 'private events',
  workshop: 'workshops',
}

// windsor and the essex county towns around it
const WINDSOR_ESSEX = /\b(windsor|essex|kingsville|leamington|lasalle|tecumseh|amherstburg|lakeshore|harrow|belle river|pelee)\b/i

// Full: an editorial page with a photo spread and a sticky card for the CTA.
// Compact: the same profile sized for a modal (plan results, the vendor's own preview, admin review).
export function VendorProfileView({ vendor, actions, compact }: { vendor: Vendor; actions?: ReactNode; compact?: boolean }) {
  const range = `${vendor.guestRange.min} – ${vendor.guestRange.max}`

  if (compact)
    return (
      <div className="grid gap-8 md:grid-cols-[1fr_1.1fr]">
        <Feature vendor={vendor} />
        <div className="min-w-0">
          <Kicker vendor={vendor} />
          <h1 className="mt-4 break-words text-3xl normal-case">{vendor.name}</h1>
          {vendor.tagline && <p className="mt-2 text-lg font-medium leading-snug">{vendor.tagline}</p>}
          <Highlights vendor={vendor} className="mt-5" />
          {actions && <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>}
          <div className="mt-7 space-y-6">
            <Section title="about">
              <About vendor={vendor} className="text-sm leading-relaxed" />
            </Section>
            <Section title="services">
              {vendor.services.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">{vendor.services.map((s) => <Chip key={s}>{s}</Chip>)}</div>
              ) : (
                <Placeholder>no services listed yet.</Placeholder>
              )}
            </Section>
            {vendor.vibes.length > 0 && (
              <Section title="the vibe">
                <div className="flex flex-wrap gap-1.5">{vendor.vibes.map((s) => <Chip key={s}>{s}</Chip>)}</div>
              </Section>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-4 text-sm">
            <span><span className="label-caps mr-2 text-stone">guests</span>{range}</span>
            <Social vendor={vendor} />
          </div>
        </div>
      </div>
    )

  return (
    <article className="container-x pt-6 md:pt-10">
      <header>
        <Kicker vendor={vendor} />
        <h1 className="mt-5 break-words text-5xl normal-case leading-[0.95] md:text-7xl">{vendor.name}</h1>
        {vendor.tagline && <p className="mt-5 max-w-2xl text-xl font-medium leading-snug md:text-2xl">{vendor.tagline}</p>}
        <Highlights vendor={vendor} className="mt-7" />
      </header>

      <Spread vendor={vendor} className="mt-10 md:mt-12" />

      <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-[1fr_340px] lg:gap-20">
        {/* first in the source so phones reach the CTA before the long read */}
        <aside className="lg:order-last">
          <div className="card p-6 lg:sticky lg:top-6">
            {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
            <dl className={`divide-y divide-ink/10 text-sm ${actions ? 'mt-6 border-t border-ink/10' : ''}`}>
              <Fact label="guests">{range}</Fact>
              {vendor.location && <Fact label="based in">{vendor.location}</Fact>}
              <Fact label="category">{categoryBySlug(vendor.categorySlug).name}</Fact>
            </dl>
            <Social vendor={vendor} labelled />
          </div>
        </aside>

        <div className="min-w-0 space-y-12">
          <Section title="about">
            <About vendor={vendor} className="max-w-2xl text-lg leading-relaxed md:text-xl" />
          </Section>
          <Section title="services">
            {vendor.services.length > 0 ? (
              <ul className="border-t border-ink/10">
                {vendor.services.map((s, i) => (
                  <li key={s} className="flex items-baseline gap-5 border-b border-ink/10 py-4">
                    <span className="label-caps w-6 shrink-0 text-stone">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-base md:text-lg">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Placeholder>no services listed yet.</Placeholder>
            )}
          </Section>
          {vendor.vibes.length > 0 && (
            <Section title="the vibe">
              <div className="flex flex-wrap gap-1.5">{vendor.vibes.map((s) => <Chip key={s}>{s}</Chip>)}</div>
            </Section>
          )}
        </div>
      </div>
    </article>
  )
}

function Kicker({ vendor }: { vendor: Vendor }) {
  const cat = categoryBySlug(vendor.categorySlug)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold lowercase text-ink ${CATEGORY_BG[cat.color]}`}>{cat.name}</span>
      {vendor.location && <span className="label-caps text-stone">{vendor.location}</span>}
    </div>
  )
}

// What they do, who they're for, where they are. Read-only in V1.
function Highlights({ vendor, className = '' }: { vendor: Vendor; className?: string }) {
  const cat = categoryBySlug(vendor.categorySlug)
  const bestFor = vendor.bestFor.map((t) => BEST_FOR[t])
  // a tag that only restates a best-for ("wedding" beside "weddings") is left out
  const tags = (vendor.tags ?? []).filter((t) => !bestFor.some((b) => b === t || b === `${t}s` || b.startsWith(`${t} `)))
  const region = WINDSOR_ESSEX.test(vendor.location) ? 'windsor-essex' : null
  if (!tags.length && !bestFor.length && !region) return null
  const pill = 'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm lowercase leading-none'
  return (
    <ul aria-label="at a glance" className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((t) => (
        <li key={t} className={`${pill} border-transparent text-ink ${CATEGORY_BG[cat.color]}`}>{t}</li>
      ))}
      {bestFor.map((t) => (
        <li key={t} className={`${pill} border-ink/15`}>{t}</li>
      ))}
      {region && (
        <li className={`${pill} border-transparent bg-mist`}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M8 14.5s-4.5-4.2-4.5-7.8a4.5 4.5 0 0 1 9 0c0 3.6-4.5 7.8-4.5 7.8Z" />
            <circle cx="8" cy="6.5" r="1.6" />
          </svg>
          {region}
        </li>
      )}
    </ul>
  )
}

// Desktop: a lead photo with two beside it and any more in full rows beneath. Phones: a swipeable strip.
function Spread({ vendor, className = '' }: { vendor: Vendor; className?: string }) {
  const imgs = vendor.images
  const n = imgs.length
  if (!n) return <NoPhotos vendor={vendor} className={`aspect-[16/10] rounded-3xl md:aspect-[21/9] ${className}`} />
  const tile = (i: number) => {
    if (n === 1) return 'md:col-span-6 md:aspect-[21/9]'
    if (n === 2) return 'md:col-span-3'
    if (i === 0) return 'md:col-span-4 md:row-span-2 md:aspect-auto'
    if (i < 3) return 'md:col-span-2'
    // past the first three, rows of three; a short last row stretches to fill the width
    const rest = n - 3
    const short = rest % 3
    if (i - 3 >= rest - short) return short === 1 ? 'md:col-span-6 md:aspect-[3/1]' : 'md:col-span-3 md:aspect-[2/1]'
    return 'md:col-span-2'
  }
  return (
    <div
      className={`-mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-3 overflow-x-auto px-6 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0 ${className}`}
    >
      {imgs.map((src, i) => (
        <div
          key={`${i}-${src}`}
          className={`relative aspect-[4/3] shrink-0 snap-start overflow-hidden rounded-2xl bg-mist md:w-auto ${n === 1 ? 'w-full' : 'w-[85%]'} ${tile(i)}`}
        >
          <img src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      ))}
    </div>
  )
}

// The compact gallery: one large photo and thumbnails to swap it.
function Feature({ vendor }: { vendor: Vendor }) {
  const [hero, setHero] = useState(0)
  const n = vendor.images.length
  if (!n) return <NoPhotos vendor={vendor} className="aspect-[4/3] rounded-3xl" />
  const current = Math.min(hero, n - 1)
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist">
        <img src={vendor.images[current]} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      {n > 1 && (
        <div className="mt-3 grid grid-cols-6 gap-2">
          {vendor.images.map((src, i) => (
            <button
              key={`${i}-${src}`}
              type="button"
              onClick={() => setHero(i)}
              aria-label={`show photo ${i + 1}`}
              aria-pressed={i === current}
              className={`relative aspect-square overflow-hidden rounded-lg bg-mist transition-opacity ${
                i === current ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NoPhotos({ vendor, className }: { vendor: Vendor; className: string }) {
  const cat = categoryBySlug(vendor.categorySlug)
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${CATEGORY_BG[cat.color]} ${className}`}>
      <span className="text-5xl font-bold tracking-tight text-ink/60">{initials(vendor.name)}</span>
      <span className="label-caps text-ink/60">photos coming soon</span>
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="label-caps mb-4 flex items-center gap-3 text-stone">
        <span aria-hidden="true" className="h-px w-6 bg-current" />
        {title}
      </h2>
      {children}
    </section>
  )
}

function About({ vendor, className }: { vendor: Vendor; className: string }) {
  if (!vendor.description) return <Placeholder>{vendor.name} hasn't added an introduction yet.</Placeholder>
  return <p className={className}>{vendor.description}</p>
}

function Placeholder({ children }: { children: ReactNode }) {
  return <p className="text-sm text-stone">{children}</p>
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-stone">{label}</dt>
      <dd className="text-right font-medium lowercase">{children}</dd>
    </div>
  )
}

// Icons, not written-out links: secondary to whatever CTA the page passes in.
function Social({ vendor, labelled }: { vendor: Vendor; labelled?: boolean }) {
  const ig = vendor.instagram
    ?.trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0]
  const site = vendor.website?.trim()
  if (!ig && !site) return null
  const icon = 'flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-ink hover:text-ink'
  const links = (
    <div className="flex items-center gap-2">
      {ig && (
        <a href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer" className={icon} aria-label={`${vendor.name} on instagram`} title={`@${ig}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
          </svg>
        </a>
      )}
      {site && (
        <a href={externalUrl(site)} target="_blank" rel="noreferrer" className={icon} aria-label={`${vendor.name} website`} title={site}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
          </svg>
        </a>
      )}
    </div>
  )
  if (!labelled) return links
  return (
    <div className="mt-2 flex items-center justify-between gap-4 border-t border-ink/10 pt-4">
      <span className="label-caps text-stone">follow along</span>
      {links}
    </div>
  )
}
