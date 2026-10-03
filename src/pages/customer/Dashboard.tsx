import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { NewEventModal } from '../../components/NewEventModal'
import { BoardCard, VendorCard } from '../../components/cards'
import { PLANNER_TYPES } from '../../data/tags'
import { splitEvents } from '../../lib/events'
import { plural } from '../../lib/format'
import { useApp } from '../../store/AppContext'

// The planner's home base once signed in: everything account- and event-related starts here.
export function CustomerDashboard() {
  const { user, myEvents, networkVendors, favourites } = useApp()
  const [adding, setAdding] = useState(false)
  if (!user) return null
  const { upcoming } = splitEvents(myEvents)
  const saved = favourites.map((id) => networkVendors.find((v) => v.id === id)).filter((v) => !!v)
  const first = user.name.split(' ')[0].toLowerCase()
  const kind = PLANNER_TYPES.find((t) => t.value === user.plannerType)?.label

  return (
    <>
      <Nav />
      <section className="keep-dark bg-ink text-paper">
        <div className="container-x py-12 md:py-16">
          <Link to="/account" className="group inline-flex items-center gap-4" title="account settings">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-paper/30 text-xl font-semibold uppercase transition-colors group-hover:border-paper">
              {first[0]}
            </span>
            <span>
              <span className="block text-4xl font-bold tracking-tight md:text-5xl">hi {first}</span>
              <span className="mt-1 block text-xs text-paper/60 transition-colors group-hover:text-paper">
                {kind ? `${kind} · ` : ''}account settings →
              </span>
            </span>
          </Link>
        </div>
      </section>

      <section className="container-x -mt-6 grid gap-5 md:grid-cols-2">
        <DashboardTile to="/network" image="https://picsum.photos/seed/hostit-explore/1200/800" title="browse vendors" sub="explore the network by category and save the ones you love." />
        <DashboardTile to="/plan" image="https://picsum.photos/seed/hostit-plan/1200/800" title="plan an event" sub="answer five questions and we'll curate a shortlist for you." />
      </section>

      <section className="container-x pt-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl">your events</h2>
            <p className="mt-1 text-sm text-stone">{upcoming.length ? `${plural(upcoming.length, 'event')} coming up.` : 'nothing on the calendar yet.'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/events" className="label-caps border-b border-ink pb-0.5">all events</Link>
            <button className="pill-dark" onClick={() => setAdding(true)}>+ add event</button>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.slice(0, 2).map((e) => <BoardCard key={e.id} event={e} />)}
          <button
            onClick={() => setAdding(true)}
            className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-mist-deep text-stone transition-colors hover:border-ink hover:text-ink"
          >
            <span className="text-3xl">+</span>
            <span className="label-caps mt-2">add event</span>
          </button>
        </div>
      </section>

      <section id="favourites" className="container-x scroll-mt-6 pt-16">
        <div className="mb-6">
          <h2 className="text-3xl">favourite vendors</h2>
          <p className="mt-1 text-sm text-stone">{saved.length ? `${plural(saved.length, 'vendor')} saved.` : 'vendors you save show up here.'}</p>
        </div>
        {saved.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {saved.map((v) => <VendorCard key={v!.id} vendor={v!} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-mist-deep p-12 text-center">
            <p className="text-sm text-stone">tap the heart on any vendor to keep them here for later.</p>
            <Link to="/network" className="pill-dark mt-5">browse the network</Link>
          </div>
        )}
      </section>

      <section className="container-x pt-16">
        <div className="card flex flex-wrap items-center justify-between gap-5 p-8">
          <div>
            <h2 className="text-2xl">need more help?</h2>
            <p className="mt-1 text-sm text-stone">questions about planning, a vendor, or your account. the host it team is happy to help.</p>
          </div>
          <Link to="/contact" className="pill-ghost">contact host it</Link>
        </div>
      </section>

      <NewEventModal open={adding} onClose={() => setAdding(false)} />
      <Footer />
    </>
  )
}

function DashboardTile({ to, image, title, sub }: { to: string; image: string; title: string; sub: string }) {
  return (
    <Link to={to} className="keep-dark group relative block aspect-[2/1] overflow-hidden rounded-3xl bg-ink text-paper md:aspect-[16/9]">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
      <div className="absolute bottom-7 left-7 right-7">
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        <p className="mt-2 max-w-sm text-sm text-paper/80">{sub}</p>
      </div>
    </Link>
  )
}
