import { useState } from 'react'
import { Footer, Nav } from '../../components/Nav'
import { toISODate } from '../../lib/format'
import { useApp } from '../../store/AppContext'

export function Availability() {
  const { user, vendorById, overrideVendor, inquiries, events } = useApp()
  const vendor = user?.vendorId ? vendorById(user.vendorId) : undefined
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  if (!vendor) return null

  const booked = new Set(
    inquiries
      .filter((i) => i.vendorId === vendor.id && i.status === 'accepted')
      .map((i) => events.find((e) => e.id === i.eventId)?.date)
      .filter(Boolean) as string[],
  )
  const blocked = new Set(vendor.unavailableDates)
  const toggle = (iso: string) => {
    const next = blocked.has(iso) ? vendor.unavailableDates.filter((d) => d !== iso) : [...vendor.unavailableDates, iso]
    overrideVendor(vendor.id, { unavailableDates: next })
  }

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const label = cursor.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }).toLowerCase()
  const today = toISODate(new Date())

  return (
    <>
      <Nav />
      <section className="bg-ink text-paper">
        <div className="container-x py-12">
          <p className="label-caps text-paper/50">{vendor.name}</p>
          <h1 className="mt-1 text-4xl md:text-5xl">availability</h1>
          <p className="mt-2 text-sm text-paper/70">tap a day to mark it unavailable. planners won't see you in survey results for blocked dates.</p>
        </div>
      </section>
      <section className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <div className="card p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <button className="pill-ghost px-4 py-2" onClick={() => setCursor(new Date(year, month - 1, 1))}>←</button>
            <h2 className="text-2xl">{label}</h2>
            <button className="pill-ghost px-4 py-2" onClick={() => setCursor(new Date(year, month + 1, 1))}>→</button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['s', 'm', 't', 'w', 't', 'f', 's'].map((d, i) => <div key={i} className="label-caps py-2 text-stone">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={`b${i}`} />
              const iso = toISODate(new Date(year, month, day))
              const isBlocked = blocked.has(iso)
              const isBooked = booked.has(iso)
              const past = iso < today
              return (
                <button
                  key={iso}
                  disabled={isBooked}
                  onClick={() => toggle(iso)}
                  className={`aspect-square rounded-xl text-sm transition-colors ${
                    isBooked ? 'bg-moss/60 font-semibold' : isBlocked ? 'bg-ink text-paper line-through' : past ? 'text-stone/50 hover:bg-mist' : 'hover:bg-mist'
                  } ${iso === today ? 'ring-1 ring-ink' : ''}`}
                  title={isBooked ? 'confirmed event' : isBlocked ? 'unavailable' : 'available'}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
        <aside className="space-y-6">
          <div className="card p-6 text-sm">
            <div className="flex items-center gap-3"><span className="h-4 w-4 rounded bg-moss/60" /> confirmed event</div>
            <div className="mt-3 flex items-center gap-3"><span className="h-4 w-4 rounded bg-ink" /> unavailable</div>
            <div className="mt-3 flex items-center gap-3"><span className="h-4 w-4 rounded border border-ink" /> today</div>
          </div>
          <div className="card p-6">
            <h3 className="text-lg">blocked dates</h3>
            {vendor.unavailableDates.length === 0 && <p className="mt-2 text-sm text-stone">none yet.</p>}
            <ul className="mt-3 space-y-1 text-sm">
              {[...vendor.unavailableDates].sort().map((d) => (
                <li key={d} className="flex items-center justify-between">
                  <span>{d}</span>
                  <button className="text-xs text-stone hover:text-ink" onClick={() => toggle(d)}>unblock</button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
      <Footer />
    </>
  )
}
