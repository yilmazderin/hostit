import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { EventType, Vendor } from '../types'
import { EVENT_TYPES } from '../data/tags'
import { useApp } from '../store/AppContext'
import { formatDate, plural } from '../lib/format'
import { Field, Modal } from './ui'

export function AddToEventModal({
  vendor,
  open,
  onClose,
  defaultEventId,
}: {
  vendor: Vendor
  open: boolean
  onClose: () => void
  defaultEventId?: string
}) {
  const { myEvents, addVendorsToEvent, createEvent } = useApp()
  const nav = useNavigate()
  const [mode, setMode] = useState<'existing' | 'new'>(myEvents.length ? 'existing' : 'new')
  const [eventId, setEventId] = useState(defaultEventId ?? myEvents[0]?.id ?? '')
  const [message, setMessage] = useState('')
  const [draft, setDraft] = useState({ name: '', type: 'private gathering' as EventType, guests: 30, date: '' })

  const finish = (id: string) => {
    addVendorsToEvent(id, [vendor.id], message || undefined)
    onClose()
    nav(`/events/${id}`)
  }

  return (
    <Modal open={open} onClose={onClose} title={`add ${vendor.name} to an event`}>
      <div className="mb-5 flex gap-2">
        <button className={`chip ${mode === 'existing' ? 'border-ink bg-ink text-paper' : 'border-mist-deep'}`} onClick={() => setMode('existing')} disabled={!myEvents.length}>
          existing event
        </button>
        <button className={`chip ${mode === 'new' ? 'border-ink bg-ink text-paper' : 'border-mist-deep'}`} onClick={() => setMode('new')}>
          new event
        </button>
      </div>

      {mode === 'existing' ? (
        <div className="space-y-2">
          {myEvents.map((e) => {
            const already = e.vendorIds.includes(vendor.id)
            return (
              <button
                key={e.id}
                disabled={already}
                onClick={() => setEventId(e.id)}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                  eventId === e.id ? 'border-ink bg-white' : 'border-mist-deep hover:border-ink'
                } disabled:opacity-50`}
              >
                <div>
                  <div className="font-semibold lowercase">{e.name}</div>
                  <div className="text-xs text-stone">
                    {e.type} · {formatDate(e.date)} · {plural(e.guests, 'guest')}
                  </div>
                </div>
                {already && <span className="label-caps text-stone">already added</span>}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="event name">
            <input className="field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. mom's 60th" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="type">
              <select className="field" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as EventType })}>
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.value}</option>
                ))}
              </select>
            </Field>
            <Field label="guests">
              <input className="field" type="number" min={1} value={draft.guests} onChange={(e) => setDraft({ ...draft, guests: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="date">
            <input className="field" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </Field>
        </div>
      )}

      <Field label="a note to the vendor (optional)">
        <textarea className="field mt-0 min-h-20" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`hi ${vendor.name.toLowerCase()}, we'd love to...`} />
      </Field>

      <div className="mt-6 flex justify-end gap-3">
        <button className="pill-ghost" onClick={onClose}>cancel</button>
        {mode === 'existing' ? (
          <button className="pill-dark" disabled={!eventId} onClick={() => finish(eventId)}>add to board</button>
        ) : (
          <button
            className="pill-dark"
            disabled={!draft.name.trim() || !draft.date}
            onClick={() => {
              const ev = createEvent({ ...draft, name: draft.name.trim(), needs: [vendor.categorySlug] })
              finish(ev.id)
            }}
          >
            create + add
          </button>
        )}
      </div>
    </Modal>
  )
}
