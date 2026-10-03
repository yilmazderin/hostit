import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { CategorySlug, CustomVendor, EventBoard as EventBoardData, EventType, ManualStatus, VibeTag } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { BoardVendorCard } from '../../components/cards'
import { AddVendorMenu } from '../../components/board/AddVendorMenu'
import { CustomVendorModal } from '../../components/board/CustomVendorModal'
import { NeedsTracker } from '../../components/board/NeedsTracker'
import { StickyNotes, TodoList } from '../../components/board/PlanningTools'
import { Chip, Field, Modal } from '../../components/ui'
import { CATEGORIES, CATEGORY_BG, categoryBySlug } from '../../data/categories'
import { EVENT_TYPES, VIBE_TAGS } from '../../data/tags'
import { formatDate, formatTime, plural } from '../../lib/format'
import { eventSurvey, surveyKey } from '../../lib/matchVendors'
import { STATUS_GROUPS, boardItems, isConsidering, type StatusGroup } from '../../lib/vendorStatus'
import { useApp } from '../../store/AppContext'

type Draft = Pick<EventBoardData, 'name' | 'type' | 'guests' | 'date' | 'vibes'> & { time: string; location: string }

const STATUS_DOT: Record<StatusGroup, string> = {
  confirmed: 'bg-moss',
  pending: 'bg-honey',
  'not-contacted': 'border border-ink/30 bg-surface',
  declined: 'bg-mist-deep',
}
const statusRank = (g: StatusGroup) => STATUS_GROUPS.findIndex((s) => s.key === g)

// The workspace for one event, top to bottom: what it is, what it still needs, who's on it, what's left to do.
export function EventBoard() {
  const { id } = useParams()
  const nav = useNavigate()
  const { myEvents, vendors, inquiryFor, removeVendorFromEvent, contactVendor, updateEvent, deleteEvent } = useApp()
  const event = myEvents.find((e) => e.id === id)
  // null while the editor is closed; filled from the event each time it opens, so cancel discards edits
  const [draft, setDraft] = useState<Draft | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusGroup | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategorySlug | null>(null)
  const [organize, setOrganize] = useState<'status' | 'category'>('status')
  const [customEditing, setCustomEditing] = useState<CustomVendor | 'new' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const vendorsTop = useRef<HTMLDivElement>(null)
  if (!event) return <Navigate to="/events" replace />

  const items = boardItems(event, vendors, inquiryFor)
  const countIn = (g: StatusGroup) => items.filter((p) => p.group === g).length
  const considering = items.filter((p) => isConsidering(p.status)).length
  const boardCategories = CATEGORIES.filter((c) => c.slug === categoryFilter || items.some((p) => p.categorySlug === c.slug))

  const visible = items.filter(
    (p) => (!statusFilter || p.group === statusFilter) && (!categoryFilter || p.categorySlug === categoryFilter),
  )
  const sections =
    organize === 'status'
      ? STATUS_GROUPS.map((g) => ({ key: g.key, label: g.label, dot: STATUS_DOT[g.key], items: visible.filter((p) => p.group === g.key) }))
      : CATEGORIES.map((c) => ({
          key: c.slug,
          label: c.name,
          dot: CATEGORY_BG[c.color],
          items: visible.filter((p) => p.categorySlug === c.slug).sort((a, b) => statusRank(a.group) - statusRank(b.group)),
        }))

  const tally = (slug: CategorySlug) => {
    const inCat = items.filter((p) => p.categorySlug === slug)
    return { confirmed: inCat.filter((p) => p.status === 'confirmed').length, considering: inCat.filter((p) => isConsidering(p.status)).length }
  }
  const need = (slug: CategorySlug) =>
    event.needs.includes(slug) ? { confirmed: tally(slug).confirmed, needed: event.needCounts?.[slug] ?? 1 } : null

  // "view" while the details still match the last results the planner saw; "update" once they've drifted
  const resultsStale = !!event.resultsBasis && event.resultsBasis !== surveyKey(eventSurvey(event))

  // tapping a need filters the vendors below it; bring them into view if they're off screen
  const filterFromNeeds = (slug: CategorySlug | null) => {
    setCategoryFilter(slug)
    const top = vendorsTop.current?.getBoundingClientRect().top ?? 0
    if (slug && (top < 0 || top > window.innerHeight - 120)) vendorsTop.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const customVendors = event.customVendors ?? []
  const saveCustom = (v: CustomVendor) => {
    updateEvent(event.id, {
      customVendors: customVendors.some((c) => c.id === v.id) ? customVendors.map((c) => (c.id === v.id ? v : c)) : [...customVendors, v],
    })
    setCustomEditing(null)
  }
  const removeCustom = (cid: string) => updateEvent(event.id, { customVendors: customVendors.filter((c) => c.id !== cid) })
  const setCustomStatus = (cid: string, status: ManualStatus) =>
    updateEvent(event.id, { customVendors: customVendors.map((c) => (c.id === cid ? { ...c, status } : c)) })
  const firstOpenNeed = event.needs.find((s) => {
    const n = need(s)
    return n && n.confirmed < n.needed
  })

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  const openEditor = () =>
    setDraft({ name: event.name, type: event.type, guests: event.guests, date: event.date, time: event.time ?? '', location: event.location ?? '', vibes: event.vibes })
  const closeEditor = () => setDraft(null)

  const missing = (label: string) => (
    <button type="button" onClick={openEditor} className="underline decoration-ink/30 underline-offset-2 opacity-60 hover:opacity-100">
      {label}
    </button>
  )
  const details = [
    event.date ? formatDate(event.date) : missing('add date'),
    event.time ? formatTime(event.time) : missing('add time'),
    event.location || missing('add location'),
    plural(event.guests, 'guest'),
  ]

  const addVendor = (align: 'right' | 'center') => (
    <AddVendorMenu event={event} need={need} align={align} onAddOwn={() => setCustomEditing('new')} />
  )

  return (
    <>
      <Nav />
      <section className={`${CATEGORY_BG[event.cover] ?? 'bg-sand'} text-ink`}>
        <div className="container-x py-8 md:py-10">
          <Link to="/events" className="label-caps opacity-60 hover:opacity-100">← all events</Link>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
            <div className="min-w-0">
              <h1 className="text-4xl md:text-5xl">{event.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
                <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold lowercase text-paper">{event.type}</span>
                {details.map((d, i) => (
                  <Fragment key={i}>
                    <span aria-hidden="true" className="opacity-40">·</span>
                    <span>{d}</span>
                  </Fragment>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {event.vibes.map((v) => <Chip key={v}>{v}</Chip>)}
                {event.vibes.length === 0 && <span className="text-xs opacity-60">no vibe tags yet</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="pill-ghost" onClick={openEditor}>edit details</button>
              <EventMenu onEdit={openEditor} onDelete={() => setConfirmDelete(true)} />
            </div>
          </div>
        </div>
      </section>

      <section className="container-x pt-10">
        <NeedsTracker
          event={event}
          tally={tally}
          activeCategory={categoryFilter}
          onSelectCategory={filterFromNeeds}
          onChange={(patch) => updateEvent(event.id, patch)}
        />
      </section>

      <section className="container-x pb-14 pt-12">
        <div ref={vendorsTop} className="mb-5 flex scroll-mt-6 flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl">vendors</h2>
            <p className="mt-1 text-sm text-stone">
              <span className="font-semibold text-ink">{countIn('confirmed')} confirmed</span>
              {' · '}{considering} considering
              {countIn('declined') > 0 && <> · {countIn('declined')} declined or unavailable</>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`pill-ghost ${resultsStale ? 'border-ink' : ''}`}
              onClick={() => nav(`/plan/results?event=${event.id}`, { state: { updated: resultsStale } })}
              title={resultsStale ? 'your event details changed since you last looked at your matches' : 'your matched host it vendors'}
            >
              {resultsStale && <span className="h-2 w-2 rounded-full bg-honey" aria-hidden="true" />}
              {resultsStale ? 'update results' : 'view results'}
            </button>
            {addVendor('right')}
          </div>
        </div>

        {items.length > 0 && (
          <div className="mb-8 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex w-full items-center justify-between gap-3">
                <span className="label-caps text-stone">status</span>
                <div className="flex items-center gap-2">
                  <span className="label-caps hidden text-stone sm:inline">group by</span>
                  <div className="inline-flex rounded-full border border-mist-deep p-0.5" role="group" aria-label="group vendors by">
                    {(['status', 'category'] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setOrganize(k)}
                        aria-pressed={organize === k}
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${organize === k ? 'bg-ink text-paper' : 'text-stone hover:text-ink'}`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Chip active={!statusFilter} onClick={() => setStatusFilter(null)}>all <span className="ml-1 opacity-60">{items.length}</span></Chip>
              {STATUS_GROUPS.map((g) => (
                <Chip key={g.key} active={statusFilter === g.key} onClick={() => setStatusFilter(statusFilter === g.key ? null : g.key)}>
                  <span className={`mr-1.5 h-2 w-2 rounded-full ${STATUS_DOT[g.key]}`} />
                  {g.label} <span className="ml-1 opacity-60">{countIn(g.key)}</span>
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="label-caps w-full text-stone">category</span>
              <Chip active={!categoryFilter} onClick={() => setCategoryFilter(null)}>all</Chip>
              {boardCategories.map((c) => (
                <Chip key={c.slug} active={categoryFilter === c.slug} onClick={() => setCategoryFilter(categoryFilter === c.slug ? null : c.slug)}>
                  {c.name} <span className="ml-1 opacity-60">{items.filter((p) => p.categorySlug === c.slug).length}</span>
                </Chip>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-mist-deep p-14 text-center">
            <h3 className="text-xl">no vendors yet</h3>
            <p className="mt-2 text-sm text-stone">find matches from the host it network, or add someone you already work with.</p>
            <div className="mt-6 flex justify-center">{addVendor('center')}</div>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-mist-deep p-12 text-center">
            <h3 className="text-xl">
              {categoryFilter && !items.some((p) => p.categorySlug === categoryFilter)
                ? `no ${categoryBySlug(categoryFilter).name} on the board yet`
                : 'no vendors match these filters'}
            </h3>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {categoryFilter && (
                <Link to={`/plan/results?event=${event.id}&category=${categoryFilter}`} className="pill-dark">find {categoryBySlug(categoryFilter).name}</Link>
              )}
              <button className="pill-ghost" onClick={() => { setStatusFilter(null); setCategoryFilter(null) }}>clear filters</button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {sections.filter((s) => s.items.length > 0).map((s) => (
              <div key={s.key}>
                <div className="mb-4 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                  <h3 className="label-caps text-ink">{s.label}</h3>
                  <span className="text-xs text-stone">{s.items.length}</span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {s.items.map((p) => (
                    <BoardVendorCard
                      key={p.key}
                      item={p}
                      eventId={event.id}
                      onContact={() => contactVendor(event.id, p.key)}
                      onRemove={() => (p.kind === 'network' ? removeVendorFromEvent(event.id, p.key) : removeCustom(p.key))}
                      onEdit={() => p.kind === 'custom' && setCustomEditing(p.custom)}
                      onStatus={(status) => setCustomStatus(p.key, status)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-mist bg-mist/40">
        <div className="container-x py-12">
          <h2 className="text-2xl">planning tools</h2>
          <p className="mt-1 text-sm text-stone">tasks and notes for this event. only you can see them.</p>
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <TodoList tasks={event.tasks ?? []} onChange={(tasks) => updateEvent(event.id, { tasks })} />
            <StickyNotes notes={event.stickies ?? []} onChange={(stickies) => updateEvent(event.id, { stickies })} />
          </div>
        </div>
      </section>

      <Modal open={draft !== null} onClose={closeEditor} title="edit details">
        {draft && <div className="space-y-4">
          <Field label="event name"><input className="field h-12" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="event type">
              <select className="field-select h-12" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as EventType })}>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.value}</option>)}
              </select>
            </Field>
            <Field label="guest count"><input className="field h-12" type="number" min={1} value={draft.guests} onChange={(e) => setDraft({ ...draft, guests: Number(e.target.value) })} /></Field>
            <Field label="date"><input className="field h-12" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
            <Field label="time"><input className="field h-12" type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} /></Field>
            <div className="col-span-2">
              <Field label="location"><input className="field h-12" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="e.g. Windsor, ON" /></Field>
            </div>
          </div>
          <div>
            <span className="label-caps mb-2 block text-stone">vibe</span>
            <div className="flex flex-wrap gap-1.5">
              {VIBE_TAGS.map((t) => <Chip key={t} active={draft.vibes.includes(t)} onClick={() => setDraft({ ...draft, vibes: toggle<VibeTag>(draft.vibes, t) })}>{t}</Chip>)}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="pill-ghost" onClick={closeEditor}>cancel</button>
            <button
              className="pill-dark"
              disabled={!draft.name.trim() || !(draft.guests >= 1)}
              onClick={() => { updateEvent(event.id, { ...draft, name: draft.name.trim(), location: draft.location.trim() }); closeEditor() }}
            >
              save
            </button>
          </div>
        </div>}
      </Modal>

      {customEditing && (
        <CustomVendorModal
          initial={customEditing === 'new' ? undefined : customEditing}
          defaultCategory={categoryFilter ?? firstOpenNeed ?? event.needs[0] ?? 'food-drink'}
          onSave={saveCustom}
          onRemove={customEditing === 'new' ? undefined : () => { removeCustom(customEditing.id); setCustomEditing(null) }}
          onClose={() => setCustomEditing(null)}
        />
      )}

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="delete this event?">
        <p className="text-sm text-stone">
          <span className="font-semibold text-ink">{event.name}</span> and everything on its board (vendors, tasks and notes) will be permanently
          deleted, and any open inquiries are withdrawn. this can't be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="pill-ghost" onClick={() => setConfirmDelete(false)}>keep event</button>
          <button
            className="pill bg-danger text-white hover:bg-danger/85"
            onClick={() => {
              deleteEvent(event.id)
              nav('/events')
            }}
          >
            delete event
          </button>
        </div>
      </Modal>
      <Footer />
    </>
  )
}

// Secondary event actions. Delete lives here: reachable from the header, never a primary button.
function EventMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  const item = 'block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-mist'
  return (
    <div ref={ref} className="relative">
      <button
        className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-ink/20 hover:border-ink"
        aria-label="more event options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="3" cy="8" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="13" cy="8" r="1.4" /></svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-48 rounded-2xl border border-mist bg-surface p-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)]">
          <button role="menuitem" className={item} onClick={() => { setOpen(false); onEdit() }}>edit details</button>
          <button role="menuitem" className={`${item} text-danger`} onClick={() => { setOpen(false); onDelete() }}>delete event</button>
        </div>
      )}
    </div>
  )
}
