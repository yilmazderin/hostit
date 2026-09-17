import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Survey, Vendor } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { VendorCard } from '../../components/cards'
import { Chip, Field, Modal } from '../../components/ui'
import { VendorProfileView } from '../../components/VendorProfileView'
import { categoryBySlug } from '../../data/categories'
import { formatDate, plural } from '../../lib/format'
import { groupByCategory, matchVendors } from '../../lib/matchVendors'
import { useApp } from '../../store/AppContext'

export function PlanResults() {
  const loc = useLocation() as { state?: { survey?: Survey } }
  const survey = loc.state?.survey
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { vendors, myEvents, createEvent, addVendorsToEvent } = useApp()
  const ctxEvent = myEvents.find((e) => e.id === params.get('event'))

  const [selected, setSelected] = useState<string[]>([])
  const [preview, setPreview] = useState<Vendor | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [mode, setMode] = useState<'new' | 'existing'>(ctxEvent ? 'existing' : 'new')
  const [targetId, setTargetId] = useState(ctxEvent?.id ?? myEvents[0]?.id ?? '')
  const [name, setName] = useState(() => (survey?.type ? `${survey.type} · ${formatDate(survey.date)}` : ''))

  const results = useMemo(() => (survey ? matchVendors(survey, vendors) : []), [survey, vendors])
  if (!survey) return <Navigate to="/plan" replace />
  const groups = groupByCategory(results, survey.needs)
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const confirm = () => {
    let id = targetId
    if (mode === 'new') {
      const ev = createEvent({ name: name.trim() || `${survey.type}`, type: survey.type!, guests: survey.guests, date: survey.date, vibes: survey.vibes, needs: survey.needs })
      id = ev.id
    }
    addVendorsToEvent(id, selected)
    nav(`/events/${id}`)
  }

  return (
    <>
      <Nav />
      <section className="bg-ink text-paper">
        <div className="container-x py-14">
          <p className="label-caps text-paper/50">your curated network</p>
          <h1 className="mt-3 text-5xl md:text-6xl">we found {plural(results.length, 'match')}.</h1>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <Chip tone="paper">{survey.type}</Chip>
            <Chip tone="paper">{plural(survey.guests, 'guest')}</Chip>
            <Chip tone="paper">{formatDate(survey.date)}</Chip>
            {survey.vibes.map((v) => <Chip key={v} tone="paper">{v}</Chip>)}
            <Link to="/plan" className="ml-2 text-xs text-paper/60 underline hover:text-paper">edit answers</Link>
          </div>
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
                    selected={selected.includes(r.vendor.id)}
                    onToggle={() => toggle(r.vendor.id)}
                    onOpen={() => setPreview(r.vendor)}
                    footer={
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {r.reasons.map((x) => (
                          <span key={x} className="rounded-full bg-moss/40 px-2.5 py-0.5 text-[11px] lowercase text-ink">{x}</span>
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
            <h3 className="text-xl">no one's free that day in those categories</h3>
            <p className="mt-2 text-sm text-stone">try another date or add a category.</p>
            <Link to="/plan" className="pill-dark mt-6">edit answers</Link>
          </div>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist bg-paper/90 backdrop-blur">
        <div className="container-x flex h-20 items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold">{plural(selected.length, 'vendor')}</span> <span className="text-stone">selected · tap a card to preview, tap the circle to select</span>
          </div>
          <button className="pill-dark" disabled={selected.length === 0} onClick={() => setConfirming(true)}>confirm selection</button>
        </div>
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} wide>
        {preview && (
          <VendorProfileView
            vendor={preview}
            compact
            actions={
              <button className={selected.includes(preview.id) ? 'pill-ghost' : 'pill-dark'} onClick={() => toggle(preview.id)}>
                {selected.includes(preview.id) ? 'remove from selection' : 'select this vendor'}
              </button>
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
              <button key={e.id} onClick={() => setTargetId(e.id)} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left ${targetId === e.id ? 'border-ink bg-white' : 'border-mist-deep hover:border-ink'}`}>
                <div>
                  <div className="font-semibold lowercase">{e.name}</div>
                  <div className="text-xs text-stone">{e.type} · {formatDate(e.date)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-stone">this sends an inquiry to each of the {selected.length} vendors.</span>
          <button className="pill-dark" onClick={confirm} disabled={mode === 'existing' && !targetId}>confirm</button>
        </div>
      </Modal>
      <Footer />
    </>
  )
}
