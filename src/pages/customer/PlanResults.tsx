import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Survey, Vendor } from '../../types'

// a signed-out planner's answers and picks, kept across the sign-up detour
const PENDING = 'hostit-pending-plan'
type Pending = { survey: Survey; selected: string[] }
function readPending(): Pending | null {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING) ?? 'null')
  } catch {
    return null
  }
}
function writePending(p: Pending | null) {
  try {
    if (p) sessionStorage.setItem(PENDING, JSON.stringify(p))
    else sessionStorage.removeItem(PENDING)
  } catch {
    /* private mode: they'll just answer again */
  }
}
import { Footer, Nav } from '../../components/Nav'
import { ContactToggle } from '../../components/AddToEventModal'
import { VendorCard } from '../../components/cards'
import { Chip, Field, Modal } from '../../components/ui'
import { VendorProfileView } from '../../components/VendorProfileView'
import { CATEGORIES, categoryBySlug } from '../../data/categories'
import { formatDate, plural } from '../../lib/format'
import { eventSurvey, groupByCategory, matchVendors, surveyKey } from '../../lib/matchVendors'
import { useApp } from '../../store/AppContext'

export function PlanResults() {
  const loc = useLocation() as { state?: { survey?: Survey; updated?: boolean } | null }
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { user, networkVendors, myEvents, createEvent, addVendorsToEvent, updateEvent } = useApp()
  const [pending] = useState(readPending)
  const ctxEvent = myEvents.find((e) => e.id === params.get('event'))
  const category = CATEGORIES.find((c) => c.slug === params.get('category'))?.slug
  // the survey flow hands its answers over in navigation state; from a board, the event's own details are the answers
  const fromEvent = !loc.state?.survey && !!ctxEvent
  const survey = loc.state?.survey ?? (ctxEvent ? eventSurvey(ctxEvent, category) : undefined) ?? pending?.survey
  // the full results for an event are what its board's "view results" returns to
  const basis = fromEvent && !category && survey ? surveyKey(survey) : null
  useEffect(() => {
    if (ctxEvent && basis && ctxEvent.resultsBasis !== basis) updateEvent(ctxEvent.id, { resultsBasis: basis })
  }, [ctxEvent?.id, basis])

  const [selected, setSelected] = useState<string[]>(() => (!loc.state?.survey && !ctxEvent && pending?.selected) || [])
  const surveyJson = survey ? JSON.stringify(survey) : ''
  useEffect(() => {
    if (!user && survey) writePending({ survey, selected })
  }, [user, surveyJson, selected.join()])
  const [preview, setPreview] = useState<Vendor | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [contact, setContact] = useState(true)
  const [mode, setMode] = useState<'new' | 'existing'>(ctxEvent ? 'existing' : 'new')
  const [targetId, setTargetId] = useState(ctxEvent?.id ?? myEvents[0]?.id ?? '')
  const [name, setName] = useState(() => (survey?.type ? `${survey.type} · ${formatDate(survey.date)}` : ''))

  if (!survey) return <Navigate to="/plan" replace />
  const results = matchVendors(survey, networkVendors)
  const groups = groupByCategory(results, survey.needs)
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const onBoard = (id: string) => !!ctxEvent?.vendorIds.includes(id)

  const saveSignedOut = () => {
    writePending({ survey, selected })
    nav('/signup?next=/plan/results')
  }

  const addToEvent = () => {
    writePending(null)
    addVendorsToEvent(ctxEvent!.id, selected, undefined, contact)
    nav(`/events/${ctxEvent!.id}`)
  }

  const confirm = () => {
    let id = targetId
    if (mode === 'new') {
      const ev = createEvent({ name: name.trim() || `${survey.type}`, type: survey.type!, guests: survey.guests, date: survey.date, vibes: survey.vibes, needs: survey.needs })
      id = ev.id
    }
    addVendorsToEvent(id, selected, undefined, contact)
    writePending(null)
    nav(`/events/${id}`)
  }

  return (
    <>
      <Nav />
      <section className="keep-dark bg-ink text-paper">
        <div className="container-x py-14">
          {ctxEvent && (
            <Link to={`/events/${ctxEvent.id}`} className="label-caps text-paper/60 hover:text-paper">← back to {ctxEvent.name}</Link>
          )}
          <p className={`label-caps text-paper/50 ${ctxEvent ? 'mt-6' : ''}`}>
            {category ? `${categoryBySlug(category).name} · matched to your event` : 'your curated network'}
          </p>
          <h1 className="mt-3 text-5xl md:text-6xl">we found {plural(results.length, 'match')}.</h1>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <Chip tone="paper">{survey.type}</Chip>
            <Chip tone="paper">{plural(survey.guests, 'guest')}</Chip>
            <Chip tone="paper">{formatDate(survey.date)}</Chip>
            {survey.vibes.map((v) => <Chip key={v} tone="paper">{v}</Chip>)}
            {fromEvent ? (
              <Link to={`/events/${ctxEvent!.id}`} className="ml-2 text-xs text-paper/60 underline hover:text-paper">change event details</Link>
            ) : (
              <Link to="/plan" className="ml-2 text-xs text-paper/60 underline hover:text-paper">edit answers</Link>
            )}
            {category && ctxEvent && (
              <Link to={`/plan/results?event=${ctxEvent.id}`} className="text-xs text-paper/60 underline hover:text-paper">all categories</Link>
            )}
          </div>
          {loc.state?.updated && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper/10 px-4 py-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-honey" aria-hidden="true" />
              refreshed for your updated event details
            </p>
          )}
        </div>
      </section>

      <section className="container-x space-y-16 py-16 pb-40">
        {groups.map((g) => {
          const cat = categoryBySlug(g.slug)
          return (
            <div key={g.slug}>
              <div className="mb-6 flex items-baseline justify-between">
                <h2 className="text-3xl">{cat.name}</h2>
                <span className="label-caps text-stone">{plural(g.results.length, 'option')}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.results.map((r) => (
                  <VendorCard
                    key={r.vendor.id}
                    vendor={r.vendor}
                    flag={onBoard(r.vendor.id) ? 'on your board' : undefined}
                    selected={selected.includes(r.vendor.id)}
                    onToggle={onBoard(r.vendor.id) ? undefined : () => toggle(r.vendor.id)}
                    onOpen={() => setPreview(r.vendor)}
                    footer={
                      <div className="mt-3 flex h-[72px] flex-wrap content-start gap-1.5 overflow-hidden">
                        {r.reasons.map((x) => (
                          <span key={x} className="rounded-full bg-moss/40 px-2.5 py-0.5 text-[11px] leading-4 lowercase text-ink">{x}</span>
                        ))}
                        {r.reasons.length === 0 && <span className="text-xs text-stone">available and in your category</span>}
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          )
        })}
        {groups.length === 0 && (
          <div className="rounded-3xl border border-dashed border-mist-deep p-16 text-center">
            <h3 className="text-xl">no one's free that day in {category ? categoryBySlug(category).name : 'those categories'}</h3>
            <p className="mt-2 text-sm text-stone">try another date or another category.</p>
            <Link to={fromEvent ? `/events/${ctxEvent!.id}` : '/plan'} className="pill-dark mt-6">{fromEvent ? 'back to the board' : 'edit answers'}</Link>
          </div>
        )}
      </section>

      {(!user || user.role === 'customer') && <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist bg-paper/90 backdrop-blur">
        <div className="container-x flex min-h-20 items-center justify-between gap-4 py-3">
          <div className="min-w-0 text-sm">
            <span className="font-semibold">{plural(selected.length, 'vendor')}</span>{' '}
            <span className="text-stone">selected<span className="hidden md:inline"> · tap a card to preview, tap the circle to select</span></span>
            {ctxEvent && (
              <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs text-stone">
                <input type="checkbox" className="h-3.5 w-3.5 accent-ink" checked={contact} onChange={(e) => setContact(e.target.checked)} />
                send {selected.length === 1 ? 'an inquiry' : 'each an inquiry'} now
              </label>
            )}
          </div>
          {!user ? (
            <div className="flex shrink-0 items-center gap-4">
              <span className="hidden text-xs text-stone md:inline">a free account saves your plan</span>
              <button className="pill-dark" onClick={saveSignedOut}>sign up to save</button>
            </div>
          ) : ctxEvent ? (
            <button className="pill-dark shrink-0" disabled={selected.length === 0} onClick={addToEvent}>add to board</button>
          ) : (
            <button className="pill-dark shrink-0" disabled={selected.length === 0} onClick={() => setConfirming(true)}>confirm selection</button>
          )}
        </div>
      </div>}

      <Modal open={!!preview} onClose={() => setPreview(null)} wide>
        {preview && (
          <VendorProfileView
            vendor={preview}
            compact
            actions={
              onBoard(preview.id) ? (
                <span className="self-center text-sm text-stone">already on your board</span>
              ) : (
                <button className={selected.includes(preview.id) ? 'pill-ghost' : 'pill-dark'} onClick={() => toggle(preview.id)}>
                  {selected.includes(preview.id) ? 'remove from selection' : 'select this vendor'}
                </button>
              )
            }
          />
        )}
      </Modal>

      <Modal open={confirming} onClose={() => setConfirming(false)} title="add to an event board">
        <div className="mb-4 flex gap-2">
          <button className={`chip ${mode === 'new' ? 'border-ink bg-ink text-paper' : 'border-mist-deep'}`} onClick={() => setMode('new')}>new board</button>
          <button className={`chip ${mode === 'existing' ? 'border-ink bg-ink text-paper' : 'border-mist-deep'}`} onClick={() => setMode('existing')} disabled={!myEvents.length}>existing board</button>
        </div>
        {mode === 'new' ? (
          <Field label="board name" hint={`${survey.type} · ${plural(survey.guests, 'guest')} · ${formatDate(survey.date)} will be saved with it.`}>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
        ) : (
          <div className="space-y-2">
            {myEvents.map((e) => (
              <button key={e.id} onClick={() => setTargetId(e.id)} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left ${targetId === e.id ? 'border-ink bg-surface' : 'border-mist-deep hover:border-ink'}`}>
                <div>
                  <div className="font-semibold lowercase">{e.name}</div>
                  <div className="text-xs text-stone">{e.type} · {formatDate(e.date)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        <ContactToggle contact={contact} onChange={setContact} who={selected.length === 1 ? 'this vendor' : `all ${selected.length} vendors`} />
        <div className="mt-6 flex justify-end">
          <button className="pill-dark" onClick={confirm} disabled={mode === 'existing' && !targetId}>confirm</button>
        </div>
      </Modal>
      <Footer />
    </>
  )
}
