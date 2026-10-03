import { Link } from 'react-router-dom'
import { Footer, Nav } from '../components/Nav'
import { dashboardPath } from '../components/RequireRole'
import { CATEGORIES, CATEGORY_BG } from '../data/categories'
import { useApp } from '../store/AppContext'

// Seven categories laid out as a spread: two wide, three tall, two wide on large screens;
// on two columns the first takes the whole row so the rest pair up evenly.
const SPREAD = [
  { span: 'sm:col-span-2 lg:col-span-3', img: 'sm:aspect-[2/1] lg:aspect-[3/2]' },
  { span: 'lg:col-span-3', img: 'lg:aspect-[3/2]' },
  { span: 'lg:col-span-2', img: 'lg:aspect-[4/5]' },
  { span: 'lg:col-span-2', img: 'lg:aspect-[4/5]' },
  { span: 'lg:col-span-2', img: 'lg:aspect-[4/5]' },
  { span: 'lg:col-span-3', img: 'lg:aspect-[3/2]' },
  { span: 'lg:col-span-3', img: 'lg:aspect-[3/2]' },
]

const AUDIENCES = [
  {
    title: 'planning for yourself',
    body: 'weddings, showers, birthdays and the gatherings in between. find the people who make it feel like yours.',
    color: 'blush',
  },
  {
    title: 'planning for a business',
    body: 'brand events, launches, team nights and client gatherings, with local vendors who get the brief.',
    color: 'sky',
  },
  {
    title: 'planning professionally',
    body: 'source trusted local vendors for your clients, with a board for every event you run.',
    color: 'honey',
  },
]

const link = 'label-caps inline-block border-b border-ink pb-0.5'

// The public home page. Signed-in accounts can visit it too; their own home is the dashboard.
export function Landing() {
  const { user } = useApp()
  const steps = [
    {
      title: 'discover the network',
      body: 'browse local vendors and experiences by category, and open any profile to see their work. no account needed.',
      cta: { to: '/network', label: 'browse the network' },
    },
    {
      title: 'match with the planning survey',
      body: "answer five quick questions about your event, from the guest count to the vibe, and see the vendors who fit and are free that day.",
      cta: { to: '/plan', label: 'start the survey' },
    },
    {
      title: 'pin it to an event board',
      body: "save vendors to a board for each event, send inquiries, and track who's confirmed, what you still need, your to-dos and notes.",
      cta: user ? null : { to: '/signup', label: 'create a free account' },
    },
  ]

  return (
    <>
      <Nav />
      <section className="keep-dark relative overflow-hidden bg-ink text-paper">
        <img src="https://picsum.photos/seed/hostit-hero/1800/1100" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/35" />
        <div className="container-x relative flex min-h-[78vh] flex-col justify-end pb-16 pt-28 md:pb-24">
          <h1 className="max-w-4xl text-5xl sm:text-7xl lg:text-8xl">make it an experience.</h1>
          <p className="mt-5 max-w-md text-sm text-paper/85 md:text-base">
            a curated network of vendors and experiences for modern events in windsor-essex.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/network" className="pill-light">browse the network</Link>
            <Link to="/plan" className="pill-ghost border-paper/50 text-paper hover:border-paper">plan an event</Link>
          </div>
          {!user && <p className="mt-5 text-xs text-paper/60">browsing is open to everyone. a free account saves your plan.</p>}
        </div>
      </section>

      <section className="container-x py-24 md:py-32">
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-16">
          <div>
            <span className="label-caps text-stone">the network</span>
            <h2 className="mt-3 text-4xl md:text-6xl">event planning, made simple.</h2>
          </div>
          <div>
            <p className="text-sm leading-relaxed text-stone md:text-base">
              from weddings and showers to birthdays, brand events and private gatherings, host it brings windsor-essex's
              event vendors and experiences into one thoughtful place. every vendor is reviewed before they join.
            </p>
            <Link to="/network" className={`${link} mt-5`}>browse the full network</Link>
          </div>
        </div>
        <div className="mt-14 grid gap-x-5 gap-y-12 sm:grid-cols-2 md:mt-20 lg:grid-cols-6 lg:gap-y-16">
          {CATEGORIES.map((c, i) => (
            <Link key={c.slug} to={`/network/${c.slug}`} className={`group block ${SPREAD[i]?.span ?? ''}`}>
              <div className={`aspect-[4/3] overflow-hidden rounded-2xl bg-mist ${SPREAD[i]?.img ?? ''}`}>
                <img
                  src={c.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2.5 text-xl md:text-2xl">
                    <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${CATEGORY_BG[c.color]}`} />
                    {c.name}
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-stone">{c.blurb}</p>
                </div>
                <span aria-hidden="true" className="mt-0.5 shrink-0 text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-mist">
        <div className="container-x grid items-center gap-12 py-24 md:grid-cols-2 md:gap-16 md:py-32">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-sand md:aspect-[4/5]">
            <img src="https://picsum.photos/seed/hostit-how/1000/1250" alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="label-caps text-stone">how it works</span>
            <h2 className="mt-3 text-4xl md:text-5xl">from first idea to booked.</h2>
            <ol className="mt-10 space-y-8">
              {steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[auto_1fr] gap-5 border-t border-mist-deep pt-6">
                  <span className="text-sm font-semibold tabular-nums text-stone">0{i + 1}</span>
                  <div>
                    <h3 className="text-xl md:text-2xl">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone">{s.body}</p>
                    {s.cta && <Link to={s.cta.to} className={`${link} mt-4`}>{s.cta.label}</Link>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="container-x py-24 md:py-32">
        <span className="label-caps text-stone">who it's for</span>
        <h2 className="mt-3 max-w-2xl text-4xl md:text-5xl">for every kind of host.</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <div key={a.title} className={`flex min-h-64 flex-col justify-between rounded-3xl p-8 ${CATEGORY_BG[a.color]}`}>
              <span className="text-sm font-semibold tabular-nums text-ink/60">0{i + 1}</span>
              <div className="mt-10">
                <h3 className="text-2xl">{a.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/75">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-stone">
          everyone gets the same planning tools today.{' '}
          <Link to="/services" className="text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink">see what's included</Link>
        </p>
      </section>

      <section className="keep-dark bg-ink text-paper">
        <div className="container-x grid items-center gap-12 py-24 md:grid-cols-2 md:gap-16 md:py-32">
          <div>
            <span className="label-caps text-paper/60">for vendors</span>
            <h2 className="mt-3 text-4xl md:text-5xl">join the network.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/75 md:text-base">
              host it is growing a curated network of local event vendors and experiences. once you're in, manage your
              profile, availability and inquiries in one place.
            </p>
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {['apply with your profile', 'host it reviews it', 'approved listings go live'].map((s, i) => (
                <li key={s} className="border-t border-paper/20 pt-3 text-sm">
                  <span className="label-caps block text-paper/50">step {i + 1}</span>
                  <span className="mt-1 block">{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-xs text-paper/60">every application is reviewed by host it. applying doesn't guarantee a place in the network.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/join" className="pill-light">join the network</Link>
              <Link to="/services#vendors" className="pill-ghost border-paper/40 text-paper hover:border-paper">how it works for vendors</Link>
            </div>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl md:aspect-[4/5]">
            <img src="https://picsum.photos/seed/hostit-vendors/1000/1250" alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container-x pt-24 text-center md:pt-32">
        <figure>
          <blockquote className="mx-auto max-w-2xl text-2xl font-medium leading-snug md:text-3xl">
            “an event is not over until everyone is done talking about it.”
          </blockquote>
          <figcaption className="label-caps mt-4 text-stone">mason cooley</figcaption>
        </figure>
        <div className="mx-auto mt-20 max-w-xl border-t border-mist pt-20">
          {user ? (
            <>
              <h2 className="text-4xl md:text-5xl">pick up where you left off.</h2>
              <p className="mt-4 text-sm text-stone md:text-base">everything you're working on lives on your dashboard.</p>
              <Link to={dashboardPath(user)} className="pill-dark mt-8">go to your dashboard</Link>
            </>
          ) : (
            <>
              <h2 className="text-4xl md:text-5xl">ready when you are.</h2>
              <p className="mt-4 text-sm text-stone md:text-base">
                browse the network freely. when you're ready to plan, a free account keeps your event boards, vendors and
                inquiries together.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/network" className="pill-dark">browse the network</Link>
                <Link to="/signup" className="pill-ghost">create a free account</Link>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
