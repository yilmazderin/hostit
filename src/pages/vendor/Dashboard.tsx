import { Link } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { Chip, StatusBadge } from '../../components/ui'
import { categoryBySlug } from '../../data/categories'
import { formatDate, plural } from '../../lib/format'
import { useApp } from '../../store/AppContext'

export function Dashboard() {
  const { user, vendorById, inquiries, events, users, setInquiryStatus } = useApp()
  const vendor = user?.vendorId ? vendorById(user.vendorId) : undefined
  if (!vendor) return null
  const cat = categoryBySlug(vendor.categorySlug)
  const mine = inquiries
    .filter((i) => i.vendorId === vendor.id)
    .map((i) => ({ ...i, event: events.find((e) => e.id === i.eventId), customer: users.find((u) => u.id === i.customerId) }))
    .filter((i) => i.event)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const pending = mine.filter((i) => i.status === 'pending')
  const confirmed = mine.filter((i) => i.status === 'accepted').sort((a, b) => a.event!.date.localeCompare(b.event!.date))
  const views = 120 + vendor.name.length * 7

  return (
    <>
      <Nav />
      <section className="bg-ink text-paper">
        <div className="container-x flex flex-wrap items-end justify-between gap-6 py-14">
          <div className="flex items-center gap-5">
            <img src={vendor.images[0]} alt="" className="h-20 w-20 rounded-2xl object-cover" />
            <div>
              <p className="label-caps text-paper/50">{cat.name}</p>
              <h1 className="mt-1 text-4xl normal-case md:text-5xl">{vendor.name}</h1>
              <p className="mt-1 text-sm text-paper/70">{vendor.tagline}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/vendor/profile" className="pill-light">edit profile</Link>
            <Link to="/vendor/availability" className="pill-ghost border-paper/50 text-paper hover:border-paper">availability</Link>
          </div>
        </div>
      </section>

      <section className="container-x -mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ['profile views', views, 'last 30 days'],
          ['pending inquiries', pending.length, 'waiting on you'],
          ['confirmed events', confirmed.length, 'on the calendar'],
          ['blocked dates', vendor.unavailableDates.length, 'marked unavailable'],
        ].map(([l, n, s]) => (
          <div key={String(l)} className="card p-5">
            <div className="label-caps text-stone">{l}</div>
            <div className="mt-2 text-3xl font-bold">{n}</div>
            <div className="text-xs text-stone">{s}</div>
          </div>
        ))}
      </section>

      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="mb-6 text-3xl">inquiries</h2>
          {mine.length === 0 && <p className="text-sm text-stone">no inquiries yet. when a planner pins you to a board, it shows up here.</p>}
          <div className="space-y-4">
            {mine.map((i) => (
              <div key={i.id} className={`card p-6 ${i.status === 'declined' ? 'opacity-60' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-bold lowercase">{i.event!.name}</div>
                    <div className="mt-1 text-xs text-stone">
                      from {i.customer?.name ?? 'a planner'} · {i.event!.type} · {formatDate(i.event!.date)} · {plural(i.event!.guests, 'guest')}
                    </div>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">{i.event!.vibes.map((v) => <Chip key={v}>{v}</Chip>)}</div>
                <p className="mt-4 rounded-xl bg-mist/60 p-4 text-sm">“{i.message}”</p>
                <div className="mt-4 flex gap-3">
                  {i.status !== 'accepted' && <button className="pill-dark" onClick={() => setInquiryStatus(i.id, 'accepted')}>accept</button>}
                  {i.status !== 'declined' && <button className="pill-ghost" onClick={() => setInquiryStatus(i.id, 'declined')}>decline</button>}
                  {i.status !== 'pending' && <button className="label-caps self-center text-stone hover:text-ink" onClick={() => setInquiryStatus(i.id, 'pending')}>undo</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside>
          <h2 className="mb-6 text-3xl">upcoming</h2>
          {confirmed.length === 0 && <p className="text-sm text-stone">nothing confirmed yet.</p>}
          <ol className="space-y-3">
            {confirmed.map((i) => (
              <li key={i.id} className="card flex items-center gap-4 p-4">
                <div className="rounded-xl bg-moss/50 px-3 py-2 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider">{formatDate(i.event!.date).split(' ')[0]}</div>
                  <div className="text-xl font-bold leading-none">{i.event!.date.split('-')[2]}</div>
                </div>
                <div>
                  <div className="font-semibold lowercase">{i.event!.name}</div>
                  <div className="text-xs text-stone">{plural(i.event!.guests, 'guest')} · {i.event!.type}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="card mt-8 p-6">
            <h3 className="text-lg">how planners see you</h3>
            <p className="mt-1 text-xs text-stone">this is the public listing on the network.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">{vendor.bestFor.map((b) => <Chip key={b}>{b}</Chip>)}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">{vendor.vibes.map((b) => <Chip key={b}>{b}</Chip>)}</div>
            <Link to="/vendor/profile" className="label-caps mt-5 inline-block border-b border-ink pb-0.5">update</Link>
          </div>
        </aside>
      </section>
      <Footer />
    </>
  )
}
