import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { CategorySlug, EventType, VibeTag } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { Chip, Field, Modal, StatusBadge } from '../../components/ui'
import { CATEGORIES, CATEGORY_BG, categoryBySlug } from '../../data/categories'
import { EVENT_TYPES, VIBE_TAGS } from '../../data/tags'
import { formatDate, plural } from '../../lib/format'
import { useApp } from '../../store/AppContext'

export function EventBoard() {
  const { id } = useParams()
  const nav = useNavigate()
  const { myEvents, vendors, inquiryFor, removeVendorFromEvent, updateEvent, deleteEvent } = useApp()
  const event = myEvents.find((e) => e.id === id)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => event ? { name: event.name, type: event.type, guests: event.guests, date: event.date, vibes: event.vibes, needs: event.needs } : null)
  if (!event || !draft) return <Navigate to="/events" replace />

  const pinned = event.vendorIds.map((vid) => vendors.find((v) => v.id === vid)).filter(Boolean)
  const coveredCats = new Set(pinned.map((v) => v!.categorySlug))
  const confirmed = pinned.filter((v) => inquiryFor(event.id, v!.id)?.status === 'accepted').length

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  return (
    <>
      <Nav />
      <section className={`${CATEGORY_BG[event.cover] ?? 'bg-sand'} text-ink`}>
        <div className="container-x py-14">
          <Link to="/events" className="label-caps opacity-60 hover:opacity-100">← all events</Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl">{event.name}</h1>
              <p className="mt-3 text-sm">
                {event.type} · {formatDate(event.date)} · {plural(event.guests, 'guest')}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {event.vibes.map((v) => <Chip key={v}>{v}</Chip>)}
                {event.vibes.length === 0 && <span className="text-xs opacity-60">no vibe tags yet</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="pill-ghost" onClick={() => setEditing(true)}>edit details</button>
              <Link to={`/explore?event=${event.id}`} className="pill-dark">add more vendors</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl">the board</h2>
            <span className="label-caps text-stone">{plural(pinned.length, 'vendor')} · {confirmed} confirmed</span>
          </div>
          {pinned.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-mist-deep p-16 text-center">
              <h3 className="text-xl">nothing pinned yet</h3>
              <p className="mt-2 text-sm text-stone">browse the network or run the survey and we'll fill this in.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link to={`/explore?event=${event.id}`} className="pill-dark">explore</Link>
                <Link to={`/plan?event=${event.id}`} className="pill-ghost">plan</Link>
              </div>
            </div>
          ) : (
            <div className="masonry columns-1 sm:columns-2 xl:columns-3">
              {pinned.map((v, i) => {
                const cat = categoryBySlug(v!.categorySlug)
                const inq = inquiryFor(event.id, v!.id)
                const tall = i % 3 === 1
                return (
                  <div key={v!.id} className="card group overflow-hidden">
                    <Link to={`/vendors/${v!.slug}?event=${event.id}`} className="block">
                      <div className={`${tall ? 'aspect-[3/4]' : 'aspect-[4/3]'} overflow-hidden bg-mist`}>
                        <img src={v!.images[(i + 1) % v!.images.length]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    </Link>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold leading-tight">{v!.name}</div>
                          <div className="mt-1 text-xs text-stone">{v!.tagline}</div>
                        </div>
                        {inq && <StatusBadge status={inq.status} />}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold lowercase ${CATEGORY_BG[cat.color]}`}>{cat.name}</span>
                        <button onClick={() => removeVendorFromEvent(event.id, v!.id)} className="text-xs text-stone hover:text-ink">remove</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div className="card p-6">
            <h3 className="text-lg">what you need</h3>
            <p className="mt-1 text-xs text-stone">categories from your plan. tap to edit.</p>
            <ul className="mt-4 space-y-2">
              {event.needs.length === 0 && <li className="text-sm text-stone">no needs listed yet.</li>}
              {event.needs.map((slug) => {
                const cat = categoryBySlug(slug)
                const done = coveredCats.has(slug)
                return (
                  <li key={slug} className="flex items-center justify-between text-sm">
                    <Link to={`/explore/${slug}?event=${event.id}`} className={done ? 'text-stone line-through' : 'hover:underline'}>{cat.name}</Link>
                    <span className={`h-5 w-5 rounded-full border ${done ? 'border-ink bg-ink' : 'border-mist-deep'}`} />
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-lg">notes</h3>
            <textarea
              className="field mt-3 min-h-36 border-transparent bg-mist/60 focus:bg-white"
              value={event.notes}
              onChange={(e) => updateEvent(event.id, { notes: e.target.value })}
              placeholder="ideas, links, reminders..."
            />
          </div>
          <button
            className="label-caps text-stone hover:text-clay"
            onClick={() => {
              if (confirm(`delete "${event.name}"? this can't be undone.`)) {
                deleteEvent(event.id)
                nav('/events')
              }
            }}
          >
            delete event
          </button>
        </aside>
      </section>

      <Modal open={editing} onClose={() => setEditing(false)} title="edit event">
        <div className="space-y-4">
          <Field label="name"><input className="field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="type">
              <select className="field" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as EventType })}>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.value}</option>)}
              </select>
            </Field>
            <Field label="guests"><input className="field" type="number" value={draft.guests} onChange={(e) => setDraft({ ...draft, guests: Number(e.target.value) })} /></Field>
            <Field label="date"><input className="field" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
          </div>
          <div>
            <span className="label-caps mb-2 block text-stone">vibe</span>
            <div className="flex flex-wrap gap-1.5">
              {VIBE_TAGS.map((t) => <Chip key={t} active={draft.vibes.includes(t)} onClick={() => setDraft({ ...draft, vibes: toggle<VibeTag>(draft.vibes, t) })}>{t}</Chip>)}
            </div>
          </div>
          <div>
            <span className="label-caps mb-2 block text-stone">needs</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => <Chip key={c.slug} active={draft.needs.includes(c.slug)} onClick={() => setDraft({ ...draft, needs: toggle<CategorySlug>(draft.needs, c.slug) })}>{c.name}</Chip>)}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="pill-ghost" onClick={() => setEditing(false)}>cancel</button>
            <button className="pill-dark" onClick={() => { updateEvent(event.id, draft); setEditing(false) }}>save</button>
          </div>
        </div>
      </Modal>
      <Footer />
    </>
  )
}
