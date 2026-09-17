import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import type { EventType } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { BoardCard } from '../../components/cards'
import { Field, Hero, Modal } from '../../components/ui'
import { EVENT_TYPES } from '../../data/tags'
import { useApp } from '../../store/AppContext'

export function Events() {
  const { myEvents, vendors, createEvent } = useApp()
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const open = params.get('new') === '1'
  const [draft, setDraft] = useState({ name: '', type: 'birthday' as EventType, guests: 30, date: '' })
  const close = () => setParams({})

  return (
    <>
      <Nav />
      <Hero title="your events" subtitle="every event is a board. pin vendors, keep notes, and watch it come together." compact>
        <button className="pill-light" onClick={() => setParams({ new: '1' })}>new event</button>
        <Link to="/plan" className="pill-ghost border-paper/50 text-paper hover:border-paper">plan with the survey</Link>
      </Hero>
      <section className="container-x py-16">
        <div className="masonry columns-1 sm:columns-2 lg:columns-3">
          <button
            onClick={() => setParams({ new: '1' })}
            className="flex w-full min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-mist-deep text-stone transition-colors hover:border-ink hover:text-ink"
          >
            <span className="text-3xl">+</span>
            <span className="label-caps mt-2">new event</span>
          </button>
          {myEvents.map((e) => (
            <BoardCard key={e.id} event={e} vendors={vendors} />
          ))}
        </div>
      </section>

      <Modal open={open} onClose={close} title="new event">
        <div className="space-y-4">
          <Field label="event name">
            <input className="field" autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. rooftop birthday" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="type">
              <select className="field" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as EventType })}>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.value}</option>)}
              </select>
            </Field>
            <Field label="guests">
              <input className="field" type="number" min={1} value={draft.guests} onChange={(e) => setDraft({ ...draft, guests: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="date">
            <input className="field" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </Field>
          <p className="text-xs text-stone">want a curated shortlist instead? <Link to="/plan" className="underline">use the planning survey</Link> and we'll create the board for you.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button className="pill-ghost" onClick={close}>cancel</button>
            <button
              className="pill-dark"
              disabled={!draft.name.trim() || !draft.date}
              onClick={() => {
                const ev = createEvent({ ...draft, name: draft.name.trim() })
                nav(`/events/${ev.id}`)
              }}
            >
              create board
            </button>
          </div>
        </div>
      </Modal>
      <Footer />
    </>
  )
}
