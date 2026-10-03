import { Link } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { Hero } from '../../components/ui'
import { useApp } from '../../store/AppContext'

const PLANNER_TOOLS = [
  {
    title: 'browse the network',
    tag: 'no account needed',
    body: 'every category and vendor profile is open to everyone. see their work, what they offer and the events they do best.',
  },
  {
    title: 'the planning survey',
    tag: 'open to everyone',
    body: "five quick questions: what you're planning, how many guests, the date, the vibe and what you need. we match you with vendors who fit and are free that day.",
  },
  {
    title: 'event boards',
    tag: 'free account',
    body: 'a board for each event. pin vendors from the network or add ones you found elsewhere, and see where each one stands, from not contacted to confirmed, plus what you still need, your to-dos and notes.',
  },
  {
    title: 'inquiries',
    tag: 'free account',
    body: 'reach out to vendors right from your board. they see your event details and can accept or decline, and you can see where each one stands.',
  },
]

const VENDOR_STEPS = [
  ['create a vendor account', 'a login for you and a draft listing for your business.'],
  ['build your profile and apply', "add your photos, services and the events you're best for, then submit it for review."],
  ['host it reviews', "the host it team reviews every application. applying doesn't guarantee a place in the network."],
  ['your listing goes live', 'once approved, planners can find you, pin you to their boards and send inquiries.'],
]

const VENDOR_TOOLS = [
  ['your profile', 'keep your photos, services and details current, so planners see you at your best.'],
  ['availability', 'block out the dates you\'re booked, so the planning survey only matches you when you\'re free.'],
  ['inquiries', "see each planner's event details in one place and accept or decline."],
]

const jump = 'pill-ghost border-paper/40 text-paper hover:border-paper'

export function Services() {
  const { user } = useApp()
  return (
    <>
      <Nav />
      <Hero
        title="services"
        subtitle="what host it offers planners, businesses and vendors."
        image="https://picsum.photos/seed/hostit-services-hero/1800/1000"
      >
        <a href="#planners" className={jump}>for planners</a>
        <a href="#businesses" className={jump}>for businesses & pros</a>
        <a href="#vendors" className={jump}>for vendors</a>
      </Hero>

      <section id="planners" className="container-x scroll-mt-8 py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <span className="label-caps text-stone">for planners</span>
            <h2 className="mt-3 text-4xl md:text-5xl">find them, plan it, keep track.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-stone md:text-base">
              a wedding, a shower, a birthday or a gathering at home: host it helps you find the right local vendors and
              keeps your planning in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/network" className="pill-dark">browse the network</Link>
              <Link to="/plan" className="pill-ghost">start the planning survey</Link>
            </div>
            <p className="mt-4 text-xs text-stone">the survey is open to everyone. a free account saves what it finds to an event board.</p>
            <div className="mt-12 hidden aspect-[4/3] overflow-hidden rounded-3xl bg-mist md:block">
              <img src="https://picsum.photos/seed/hostit-services-planners/1200/900" alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          </div>
          <ul className="divide-y divide-mist-deep border-y border-mist-deep">
            {PLANNER_TOOLS.map((t) => (
              <li key={t.title} className="py-7">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-xl md:text-2xl">{t.title}</h3>
                  <span className="label-caps text-stone">{t.tag}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-stone">{t.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="businesses" className="scroll-mt-8 bg-mist">
        <div className="container-x grid items-center gap-12 py-24 md:grid-cols-2 md:gap-16 md:py-32">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-sand md:aspect-[4/5]">
            <img src="https://picsum.photos/seed/hostit-services-business/1000/1250" alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="label-caps text-stone">for businesses & professional planners</span>
            <h2 className="mt-3 text-4xl md:text-5xl">planning for work, or for a living.</h2>
            <p className="mt-5 text-sm leading-relaxed text-stone md:text-base">
              brand events, launches, team nights and client gatherings, or a calendar full of other people's celebrations.
              today you get the same tools as every planner: the whole network, the planning survey, and an event board for
              each event you're running.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="border-t border-mist-deep pt-4">
                <h3 className="text-lg">for a business</h3>
                <p className="mt-1 text-sm text-stone">source local vendors for brand moments, team gatherings and client events.</p>
              </div>
              <div className="border-t border-mist-deep pt-4">
                <h3 className="text-lg">planning professionally</h3>
                <p className="mt-1 text-sm text-stone">a board per client event, with every vendor's status, to-dos and notes in view.</p>
              </div>
            </div>
            <p className="mt-8 rounded-2xl bg-paper/70 p-5 text-sm leading-relaxed">
              <span className="label-caps mb-1 block text-stone">in the works</span>
              options tailored to businesses and professional planners are planned. tell us how you plan when you create an
              account; it helps shape what comes next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {!user && <Link to="/signup" className="pill-dark">create an account</Link>}
              <Link to="/contact" className="pill-ghost">talk to us</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="vendors" className="container-x scroll-mt-8 py-24 md:py-32">
        <div className="max-w-2xl">
          <span className="label-caps text-stone">for vendors</span>
          <h2 className="mt-3 text-4xl md:text-5xl">join a curated network.</h2>
          <p className="mt-5 text-sm leading-relaxed text-stone md:text-base">
            host it is a curated network of local event vendors and experiences, and listings are by application. here's how
            a business gets in.
          </p>
        </div>
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VENDOR_STEPS.map(([title, body], i) => (
            <li key={title} className="card flex flex-col p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-mist-deep text-xs font-semibold">{i + 1}</span>
              <h3 className="mt-5 text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">{body}</p>
            </li>
          ))}
        </ol>

        <div className="keep-dark mt-6 rounded-3xl bg-ink p-8 text-paper md:p-12">
          <span className="label-caps text-paper/60">once you're live</span>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {VENDOR_TOOLS.map(([title, body]) => (
              <div key={title} className="border-t border-paper/20 pt-4">
                <h3 className="text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link to="/join" className="pill-dark">join the network</Link>
          <Link to="/terms#vendors" className="label-caps border-b border-ink pb-0.5">read the vendor terms</Link>
        </div>
      </section>

      <section className="container-x pt-8 text-center">
        <h2 className="text-3xl md:text-4xl">not sure where you fit?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone">send us a note and we'll point you in the right direction.</p>
        <Link to="/contact" className="pill-ghost mt-6">get in touch</Link>
      </section>
      <Footer />
    </>
  )
}
