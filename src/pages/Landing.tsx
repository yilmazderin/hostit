import { Link } from 'react-router-dom'
import { Footer, Nav } from '../components/Nav'
import { dashboardPath } from '../components/RequireRole'
import { useApp } from '../store/AppContext'

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
      title: 'find your matches',
      body: "tell us about your event, from the guest count to the experience you're imagining, and discover vendors that fit your plans.",
      cta: { to: '/plan', label: 'start the survey' },
    },
    {
      title: 'pin it to an event board',
      body: "save vendors to a board for each event, send inquiries, and track who's confirmed, what you still need, your to-dos and notes.",
      cta: user ? null : { to: '/signup?as=planner', label: 'create a free account' },
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

      <section className="keep-dark bg-ink text-paper">
        <div className="container-x grid items-center gap-12 py-24 md:grid-cols-2 md:gap-16 md:py-32">
          <div>
            <span className="label-caps text-paper/60">for vendors</span>
            <h2 className="mt-3 text-4xl md:text-5xl">join the network.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/75 md:text-base">
              host it is growing a curated network of local event vendors and experiences. apply with your business, and
              if you're accepted, host it prepares and publishes your profile.
            </p>
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {['apply with your business', 'host it reviews it', 'we prepare and publish your profile'].map((s, i) => (
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
                <Link to="/signup?as=planner" className="pill-ghost">create a free account</Link>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
