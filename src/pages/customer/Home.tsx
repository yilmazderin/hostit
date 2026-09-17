import { Link } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { BoardCard } from '../../components/cards'
import { useApp } from '../../store/AppContext'

export function Home() {
  const { user, myEvents, vendors } = useApp()
  return (
    <>
      <Nav />
      <section className="bg-ink text-paper">
        <div className="container-x py-16 md:py-20">
          <p className="label-caps text-paper/60">hi {user?.name.split(' ')[0].toLowerCase()}</p>
          <h1 className="mt-3 text-5xl md:text-7xl">what are we making?</h1>
        </div>
      </section>
      <section className="container-x -mt-8 grid gap-6 md:grid-cols-2">
        <Link to="/explore" className="group relative block aspect-[16/10] overflow-hidden rounded-3xl bg-ink text-paper">
          <img src="https://picsum.photos/seed/hostit-explore/1200/800" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-3xl md:text-4xl">explore the network</h2>
            <p className="mt-2 text-sm text-paper/80">browse by category, explore their work, and pin the ones that fit.</p>
            <span className="pill-light mt-5">browse vendors</span>
          </div>
        </Link>
        <Link to="/plan" className="group relative block aspect-[16/10] overflow-hidden rounded-3xl bg-ink text-paper">
          <img src="https://picsum.photos/seed/hostit-plan/1200/800" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-3xl md:text-4xl">plan an event</h2>
            <p className="mt-2 text-sm text-paper/80">tell us what you're planning and we'll curate a shortlist for you.</p>
            <span className="pill-light mt-5">start planning</span>
          </div>
        </Link>
      </section>

      <section className="container-x py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl">your events</h2>
            <p className="mt-1 text-sm text-stone">boards you're building.</p>
          </div>
          <Link to="/events" className="label-caps border-b border-ink pb-0.5">see all</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myEvents.slice(0, 3).map((e) => (
            <BoardCard key={e.id} event={e} vendors={vendors} />
          ))}
          <Link to="/events?new=1" className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-mist-deep text-stone transition-colors hover:border-ink hover:text-ink">
            <span className="text-3xl">+</span>
            <span className="label-caps mt-2">new event</span>
          </Link>
        </div>
      </section>
      <Footer />
    </>
  )
}
