import { useState } from 'react'
import type { Vendor } from '../types'
import { CATEGORY_BG, categoryBySlug } from '../data/categories'
import { Chip } from './ui'

export function VendorProfileView({ vendor, actions, compact }: { vendor: Vendor; actions?: React.ReactNode; compact?: boolean }) {
  const cat = categoryBySlug(vendor.categorySlug)
  const [hero, setHero] = useState(0)
  return (
    <div className={compact ? '' : 'container-x py-12'}>
      <div className={`grid gap-10 ${compact ? 'md:grid-cols-[1fr_1.1fr]' : 'md:grid-cols-[1.1fr_1fr]'}`}>
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-mist">
            <img src={vendor.images[hero]} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {vendor.images.map((src, i) => (
              <button key={src} onClick={() => setHero(i)} className={`aspect-square overflow-hidden rounded-lg ${i === hero ? 'ring-2 ring-ink' : 'opacity-80 hover:opacity-100'}`}>
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold lowercase ${CATEGORY_BG[cat.color]}`}>{cat.name}</span>
          <h1 className={`mt-4 ${compact ? 'text-3xl' : 'text-4xl md:text-5xl'} normal-case`}>{vendor.name}</h1>
          <p className="label-caps mt-2 text-stone">{vendor.location}</p>
          <p className="mt-5 text-lg font-medium leading-snug">{vendor.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-stone">{vendor.description}</p>

          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}

          <dl className="mt-8 space-y-5 text-sm">
            <div>
              <dt className="label-caps text-stone">services</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">{vendor.services.map((s) => <Chip key={s}>{s}</Chip>)}</dd>
            </div>
            <div>
              <dt className="label-caps text-stone">best for</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">{vendor.bestFor.map((s) => <Chip key={s}>{s}</Chip>)}</dd>
            </div>
            <div>
              <dt className="label-caps text-stone">the vibe</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">{vendor.vibes.map((s) => <Chip key={s}>{s}</Chip>)}</dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="label-caps text-stone">guest range</dt>
                <dd className="mt-1">{vendor.guestRange.min} – {vendor.guestRange.max}</dd>
              </div>
              <div>
                <dt className="label-caps text-stone">connect</dt>
                <dd className="mt-1 space-x-3">
                  {vendor.instagram && <span>{vendor.instagram}</span>}
                  {vendor.website && <span className="text-stone">{vendor.website}</span>}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
