import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CategorySlug, EventType, VibeTag } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { Chip, Field, Modal } from '../../components/ui'
import { VendorProfileView } from '../../components/VendorProfileView'
import { CATEGORIES, CATEGORY_TAGS } from '../../data/categories'
import { EVENT_TYPES, VIBE_TAGS } from '../../data/tags'
import { listingOf } from '../../lib/application'
import { useApp } from '../../store/AppContext'

export function EditProfile() {
  const { user, vendorById, overrideVendor } = useApp()
  const vendor = user?.vendorId ? vendorById(user.vendorId) : undefined
  const [form, setForm] = useState(() => vendor && {
    name: vendor.name,
    categorySlug: vendor.categorySlug,
    location: vendor.location,
    tagline: vendor.tagline,
    description: vendor.description,
    services: vendor.services.join(', '),
    tags: vendor.tags ?? [],
    bestFor: vendor.bestFor,
    vibes: vendor.vibes,
    min: vendor.guestRange.min,
    max: vendor.guestRange.max,
    instagram: vendor.instagram ?? '',
    website: vendor.website ?? '',
    images: vendor.images,
  })
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(false)
  if (!vendor || !form) return null
  // the basics are what host it approved; after that, changing them goes through the team
  const approved = listingOf(vendor) === 'approved'

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  const draftVendor = {
    ...vendor,
    ...(approved ? {} : { name: form.name.trim() || vendor.name, categorySlug: form.categorySlug, location: form.location }),
    tagline: form.tagline,
    description: form.description,
    services: form.services.split(',').map((s) => s.trim()).filter(Boolean),
    // only tags that belong to the (possibly changed) category survive
    tags: form.tags.filter((t) => CATEGORY_TAGS[approved ? vendor.categorySlug : form.categorySlug].includes(t)),
    bestFor: form.bestFor,
    vibes: form.vibes,
    guestRange: { min: form.min, max: form.max },
    instagram: form.instagram || undefined,
    website: form.website || undefined,
    images: form.images,
  }
  const save = () => {
    const { id: _id, slug: _s, unavailableDates: _u, featured: _f, listing: _ls, submittedAt: _sa, review: _r, ...patch } = draftVendor
    overrideVendor(vendor.id, patch)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }
  const move = (i: number, dir: -1 | 1) => {
    const imgs = [...form.images]
    const j = i + dir
    if (j < 0 || j >= imgs.length) return
    ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
    setForm({ ...form, images: imgs })
  }

  return (
    <>
      <Nav />
      <section className="keep-dark bg-ink text-paper">
        <div className="container-x flex flex-wrap items-end justify-between gap-4 py-12">
          <div>
            <Link to="/vendor" className="label-caps text-paper/50 hover:text-paper">← {approved ? 'dashboard' : 'your application'}</Link>
            <h1 className="mt-1 text-4xl md:text-5xl">edit your profile</h1>
          </div>
          <button className="pill-ghost border-paper/50 text-paper hover:border-paper" onClick={() => setPreview(true)}>preview</button>
        </div>
      </section>
      <section className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {approved ? (
            <p className="rounded-2xl bg-mist/60 p-4 text-xs text-stone">
              <span className="font-semibold text-ink">{vendor.name}</span> · {vendor.location}. to change your business name, category or location, <Link to="/contact" className="underline">contact host it</Link>.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="business name"><input className="field h-12" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="category">
                <select className="field-select h-12" value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value as CategorySlug })}>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="based in"><input className="field h-12" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
            </div>
          )}
          <Field label="tagline"><input className="field" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
          <Field label="about"><textarea className="field min-h-36" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="services" hint="comma separated"><input className="field" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} /></Field>
          <div>
            <span className="label-caps mb-2 block text-stone">what you offer</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_TAGS[approved ? vendor.categorySlug : form.categorySlug].map((t) => (
                <Chip key={t} active={form.tags.includes(t)} onClick={() => setForm({ ...form, tags: toggle<string>(form.tags, t) })}>{t}</Chip>
              ))}
            </div>
            <p className="mt-2 text-xs text-stone">planners filter your category by these. pick the ones that describe you best.</p>
          </div>
          <div>
            <span className="label-caps mb-2 block text-stone">best for</span>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.map((t) => <Chip key={t.value} active={form.bestFor.includes(t.value)} onClick={() => setForm({ ...form, bestFor: toggle<EventType>(form.bestFor, t.value) })}>{t.value}</Chip>)}
            </div>
            <p className="mt-2 text-xs text-stone">these feed the planning survey. the more accurate, the better your matches.</p>
          </div>
          <div>
            <span className="label-caps mb-2 block text-stone">the vibe</span>
            <div className="flex flex-wrap gap-1.5">
              {VIBE_TAGS.map((t) => <Chip key={t} active={form.vibes.includes(t)} onClick={() => setForm({ ...form, vibes: toggle<VibeTag>(form.vibes, t) })}>{t}</Chip>)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Field label="min guests"><input className="field" type="number" value={form.min} onChange={(e) => setForm({ ...form, min: Number(e.target.value) })} /></Field>
            <Field label="max guests"><input className="field" type="number" value={form.max} onChange={(e) => setForm({ ...form, max: Number(e.target.value) })} /></Field>
            <Field label="instagram"><input className="field" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></Field>
            <Field label="website"><input className="field" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
          </div>
          <div>
            <span className="label-caps mb-2 block text-stone">gallery</span>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {form.images.map((src, i) => (
                <div key={src} className="group relative aspect-square overflow-hidden rounded-xl bg-mist">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <div className="keep-dark absolute inset-0 flex items-center justify-center gap-1 bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="rounded-full bg-paper px-2 py-1 text-xs" onClick={() => move(i, -1)}>←</button>
                    <button className="rounded-full bg-paper px-2 py-1 text-xs" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}>✕</button>
                    <button className="rounded-full bg-paper px-2 py-1 text-xs" onClick={() => move(i, 1)}>→</button>
                  </div>
                  {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-paper px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">cover</span>}
                </div>
              ))}
              <button
                className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-mist-deep text-stone hover:border-ink hover:text-ink"
                onClick={() => setForm({ ...form, images: [...form.images, `https://picsum.photos/seed/${vendor.slug}-${Date.now()}/800/600`] })}
              >
                + add
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <button className="pill-dark" onClick={save}>save changes</button>
            {saved && <span className="text-sm text-stone">{approved ? 'saved. planners see this immediately.' : 'saved to your application.'}</span>}
          </div>
        </div>
        <aside className="card h-fit p-6">
          <h3 className="text-lg">card preview</h3>
          <p className="mt-1 text-xs text-stone">how you appear in category grids and survey results.</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-mist">
            <div className="flex aspect-[4/3] items-center justify-center bg-mist">
              {form.images[0] ? <img src={form.images[0]} alt="" className="h-full w-full object-cover" /> : <span className="label-caps text-stone">add a cover photo</span>}
            </div>
            <div className="p-4">
              <div className="font-semibold">{draftVendor.name}</div>
              <div className="mt-1 text-sm text-stone">{form.tagline}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">{form.bestFor.slice(0, 3).map((t) => <Chip key={t}>{t}</Chip>)}</div>
            </div>
          </div>
        </aside>
      </section>
      <Modal open={preview} onClose={() => setPreview(false)} wide>
        <VendorProfileView vendor={draftVendor} compact />
      </Modal>
      <Footer />
    </>
  )
}
