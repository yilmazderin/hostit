import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import type { CategorySlug, EventType } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { VendorCard } from '../../components/cards'
import { Chip, Hero } from '../../components/ui'
import { CATEGORIES, categoryBySlug } from '../../data/categories'
import { EVENT_TYPES } from '../../data/tags'
import { useApp } from '../../store/AppContext'

export function Category() {
  const { categorySlug } = useParams()
  const [params] = useSearchParams()
  const eventCtx = params.get('event')
  const { vendors } = useApp()
  const [filter, setFilter] = useState<EventType | null>(null)
  const valid = CATEGORIES.some((c) => c.slug === categorySlug)
  if (!valid) return <Navigate to="/explore" replace />
  const cat = categoryBySlug(categorySlug as CategorySlug)
  const list = vendors.filter((v) => v.categorySlug === cat.slug && (!filter || v.bestFor.includes(filter)))
  return (
    <>
      <Nav />
      <Hero title={cat.name} subtitle={cat.blurb} image={cat.image} />
      <section className="container-x py-16">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Link to="/explore" className="label-caps mr-4 text-stone hover:text-ink">← all categories</Link>
          <Chip active={!filter} onClick={() => setFilter(null)}>all</Chip>
          {EVENT_TYPES.map((t) => (
            <Chip key={t.value} active={filter === t.value} onClick={() => setFilter(t.value)}>{t.value}</Chip>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <VendorCard key={v.id} vendor={v} to={`/vendors/${v.slug}${eventCtx ? `?event=${eventCtx}` : ''}`} />
          ))}
        </div>
        {list.length === 0 && <p className="py-12 text-center text-sm text-stone">no vendors in this category match that filter yet.</p>}
      </section>
      <Footer />
    </>
  )
}
