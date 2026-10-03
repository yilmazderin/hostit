import { useSearchParams, Link } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { NewEventModal } from '../../components/NewEventModal'
import { BoardCard, FeaturedEventCard } from '../../components/cards'
import { Hero } from '../../components/ui'
import { splitEvents } from '../../lib/events'
import { plural } from '../../lib/format'
import { useApp } from '../../store/AppContext'

export function Events() {
  const { myEvents } = useApp()
  const [params, setParams] = useSearchParams()
  const open = params.get('new') === '1'
  const close = () => setParams({})
  const { upcoming, past } = splitEvents(myEvents)
  const [next, ...later] = upcoming

  const newTile = (
    <button
      onClick={() => setParams({ new: '1' })}
      className="flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-mist-deep text-stone transition-colors hover:border-ink hover:text-ink"
    >
      <span className="text-3xl">+</span>
      <span className="label-caps mt-2">new event</span>
    </button>
  )

  return (
    <>
      <Nav />
      <Hero title="your events" subtitle="every event is a board. pin vendors, keep notes, and watch it come together." compact>
        <button className="pill-light" onClick={() => setParams({ new: '1' })}>new event</button>
        <Link to="/plan" className="pill-ghost border-paper/50 text-paper hover:border-paper">plan with the survey</Link>
      </Hero>

      <section className="container-x py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-3xl">upcoming</h2>
          <span className="label-caps text-stone">{plural(upcoming.length, 'event')}</span>
        </div>
        {next ? (
          <>
            <FeaturedEventCard event={next} />
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {later.map((e) => <BoardCard key={e.id} event={e} />)}
              {newTile}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-mist-deep p-14 text-center">
            <h3 className="text-xl">nothing on the calendar</h3>
            <p className="mt-2 text-sm text-stone">start a board for your next event, or let the survey build one for you.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button className="pill-dark" onClick={() => setParams({ new: '1' })}>new event</button>
              <Link to="/plan" className="pill-ghost">plan with the survey</Link>
            </div>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="container-x">
          <div className="mb-6 flex items-baseline justify-between border-t border-mist pt-12">
            <h2 className="text-2xl text-stone">past events</h2>
            <span className="label-caps text-stone">{plural(past.length, 'event')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {past.map((e) => <BoardCard key={e.id} event={e} past />)}
          </div>
        </section>
      )}

      <NewEventModal open={open} onClose={close} />
      <Footer />
    </>
  )
}
