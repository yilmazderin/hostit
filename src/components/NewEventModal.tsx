import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { EventType } from '../types'
import { EVENT_TYPES } from '../data/tags'
import { useApp } from '../store/AppContext'
import { Field, Modal } from './ui'

const blank = { name: '', type: 'birthday' as EventType, guests: 30, date: '', time: '', location: '' }

// Opens over whatever page asked for it; closing leaves you right there. Creating goes to the new board.
export function NewEventModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createEvent } = useApp()
  const nav = useNavigate()
  const [draft, setDraft] = useState(blank)
  const close = () => {
    setDraft(blank)
    onClose()
  }
  return (
    <Modal open={open} onClose={close} title="new event">
      <div className="space-y-4">
        <Field label="event name">
          <input className="field h-12" autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. rooftop birthday" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="event type">
            <select className="field-select h-12" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as EventType })}>
              {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.value}</option>)}
            </select>
          </Field>
          <Field label="guest count">
            <input className="field h-12" type="number" min={1} value={draft.guests} onChange={(e) => setDraft({ ...draft, guests: Number(e.target.value) })} />
          </Field>
          <Field label="date">
            <input className="field h-12" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </Field>
          <Field label="time">
            <input className="field h-12" type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
          </Field>
          <div className="col-span-2">
            <Field label="location">
              <input className="field h-12" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="optional · e.g. Windsor, ON" />
            </Field>
          </div>
        </div>
        <p className="text-xs text-stone">
          want a curated shortlist instead? <Link to="/plan" className="underline">use the planning survey</Link> and we'll build the board for you.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button className="pill-ghost" onClick={close}>cancel</button>
          <button
            className="pill-dark"
            disabled={!draft.name.trim() || !draft.date || !(draft.guests >= 1)}
            onClick={() => {
              const ev = createEvent({ ...draft, name: draft.name.trim(), location: draft.location.trim() })
              setDraft(blank)
              nav(`/events/${ev.id}`)
            }}
          >
            create board
          </button>
        </div>
      </div>
    </Modal>
  )
}
