import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import type { CategorySlug, Vendor } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { VendorCard } from '../../components/cards'
import { EmptyState } from '../../components/ui'
import { CATEGORIES, CATEGORY_BG, CATEGORY_TAGS, categoryBySlug } from '../../data/categories'
import { plural } from '../../lib/format'
import { useApp } from '../../store/AppContext'

const chip = (on: boolean) => `chip ${on ? 'border-ink bg-ink text-paper' : 'border-mist-deep text-ink hover:border-ink'}`

export function Category() {
  const { categorySlug } = useParams()
  const [params] = useSearchParams()
  const eventCtx = params.get('event')
  const { networkVendors } = useApp()
  const [picked, setPicked] = useState<string[]>([])
  const valid = CATEGORIES.some((c) => c.slug === categorySlug)
  if (!valid) return <Navigate to="/network" replace />
  const cat = categoryBySlug(categorySlug as CategorySlug)
  const all = networkVendors.filter((v) => v.categorySlug === cat.slug)
  // only tags someone here actually offers
  const tags = CATEGORY_TAGS[cat.slug].filter((t) => all.some((v) => v.tags?.includes(t)))
  // any one picked tag is enough to match
  const list = picked.length ? all.filter((v) => v.tags?.some((t) => picked.includes(t))) : all
  const toggle = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))

  // the card shows its tags, matched ones first, so a filter's effect is visible
  const footer = (v: Vendor) => {
    const shown = v.tags?.length ? [...v.tags].sort((a, b) => Number(picked.includes(b)) - Number(picked.includes(a))) : v.bestFor
    return (
      <div className="mt-3 flex h-[26px] flex-wrap gap-1.5 overflow-hidden">
        {shown.slice(0, 3).map((t) => (
          <span key={t} className={chip(picked.includes(t))}>{t}</span>
        ))}
      </div>
    )
  }

  return (
    <>
      <Nav dark={false} />
      <section className="container-x pt-8 md:pt-12">
        <Link to="/network" className="label-caps text-stone hover:text-ink">← all categories</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-14">
          <div>
            <h1 className="break-words text-5xl leading-[0.95] md:text-6xl xl:text-7xl">{cat.name}</h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-stone md:text-lg">{cat.blurb}</p>
            <p className="label-caps mt-6 flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-current" />
              {plural(all.length, 'vendor')}
            </p>
          </div>
          <div className={`relative aspect-[16/9] overflow-hidden rounded-3xl lg:aspect-[4/3] ${CATEGORY_BG[cat.color]}`}>
            <img src={cat.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container-x pt-14">
        {tags.length > 0 && (
          <div role="group" aria-label="filter by tag" className="mb-8 flex flex-wrap items-center gap-2 border-y border-ink/10 py-4">
            <span className="label-caps mr-2 text-stone">filter</span>
            <button type="button" aria-pressed={!picked.length} onClick={() => setPicked([])} className={chip(!picked.length)}>all</button>
            {tags.map((t) => (
              <button key={t} type="button" aria-pressed={picked.includes(t)} onClick={() => toggle(t)} className={chip(picked.includes(t))}>
                {t}
              </button>
            ))}
            {picked.length > 0 && <span className="ml-auto pl-2 text-xs text-stone">{list.length} of {all.length}</span>}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <VendorCard key={v.id} vendor={v} to={`/vendors/${v.slug}${eventCtx ? `?event=${eventCtx}` : ''}`} footer={footer(v)} />
          ))}
        </div>
        {all.length === 0 ? (
          <EmptyState title="no vendors here yet" sub="new vendors join the network regularly. check back soon." cta="back to the network" to="/network" />
        ) : (
          list.length === 0 && (
            <div className="rounded-3xl border border-dashed border-mist-deep p-12 text-center">
              <h3 className="text-xl">nothing matches those tags yet</h3>
              <p className="mt-2 text-sm text-stone">try fewer tags, or see everyone in {cat.name}.</p>
              <button type="button" className="pill-dark mt-6" onClick={() => setPicked([])}>clear filters</button>
            </div>
          )
        )}
      </section>
      <Footer />
    </>
  )
}
