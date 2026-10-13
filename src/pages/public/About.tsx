import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { Hero } from '../../components/ui'

const inlineLink = 'text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink'

// Carried over from the original host it site; the client asked to keep the wording and casing as written.
const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: 'i want to host an event, where do i start?',
    a: 'browse the Host It vendor network by category, explore each profile, and connect directly with the vendors who fit your event.',
  },
  {
    q: 'how do i contact a vendor?',
    a: 'each vendor profile includes their preferred contact method. use the connect or socials button to reach out to them directly.',
  },
  {
    q: 'does Host It handle bookings or payments?',
    a: 'not currently. Host It helps you discover local vendors, but all availability, pricing, bookings, and payments are arranged directly with the vendor.',
  },
  {
    q: 'how do i apply as a vendor?',
    a: (
      <>
        complete our vendor application with information about your business and services. we review each application to
        ensure it fits the Host It network. visit our <Link to="/join" className={inlineLink}>join page</Link> to fill out the form.
      </>
    ),
  },
  {
    q: 'what does it mean to join the network?',
    a: 'approved vendors receive a profile on the Host It website and may be considered for social features, collaborations, and future event opportunities.',
  },
  {
    q: 'is there a cost to join?',
    a: 'there is currently no fee or commitment to be part of the Host It network.',
  },
  {
    q: 'how can i stay updated?',
    a: (
      <>
        follow Host It on{' '}
        <a href="https://instagram.com/host.itevents" target="_blank" rel="noreferrer" className={inlineLink}>Instagram</a>{' '}
        and join our email list for new vendors, local inspiration, features, and upcoming opportunities.
      </>
    ),
  },
]

function Faq() {
  const [open, setOpen] = useState<number[]>([])
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]))
  return (
    <ul className="border-b border-mist-deep">
      {FAQS.map((f, i) => {
        const isOpen = open.includes(i)
        return (
          <li key={f.q} className="border-t border-mist-deep">
            <h3 className="normal-case">
              <button
                type="button"
                id={`faq-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => toggle(i)}
                className="flex w-full items-start justify-between gap-6 py-5 text-left text-lg md:text-xl"
              >
                <span className="min-w-0">{f.q}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                  className={`mt-1.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                >
                  <path d="M8 2v12M2 8h12" />
                </svg>
              </button>
            </h3>
            <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!isOpen}>
              <p className="max-w-xl pb-6 pr-10 text-sm leading-relaxed text-stone md:text-base">{f.a}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// Placeholder copy the team will replace with their own story. It deliberately states no facts about the
// business (founders, dates, numbers, addresses), only what the product does.
const PRINCIPLES = [
  {
    title: 'curated, not crowded',
    body: "every vendor is reviewed by host it before they join the network, so what you browse is a considered selection, not an open directory.",
  },
  {
    title: 'local first',
    body: 'host it is built around windsor-essex: the vendors, venues and experiences that make events here feel like here.',
  },
  {
    title: 'free to explore',
    body: "browse every category and vendor profile without an account. when you're ready to plan, a free account keeps it all together.",
  },
]

export function About() {
  return (
    <>
      <Nav />
      <Hero
        title="about host it"
        subtitle="a curated local network for discovering event vendors, services and experiences in windsor-essex."
        image="https://picsum.photos/seed/hostit-about-hero/1800/1000"
      />

      <section className="container-x grid gap-10 py-24 md:grid-cols-[1fr_1.2fr] md:gap-16 md:py-32">
        <div>
          <span className="label-caps text-stone">what host it is</span>
          <h2 className="mt-3 text-4xl md:text-5xl">one thoughtful place to plan.</h2>
        </div>
        <div className="space-y-5 text-sm leading-relaxed text-stone md:text-base">
          <p>
            host it brings local event vendors, services and experiences together: food and drink, styling and decor, photo
            and moments, entertainment, workshops, wellness, and venues. planning a gathering starts in one place instead of
            a dozen open tabs.
          </p>
          <p>
            alongside the network, host it gives planners simple tools to pull it all together: a planning survey that
            matches vendors to your event, and event boards to keep track of who you've reached out to, who's confirmed and
            what's still to do.
          </p>
          <p>
            it's made for weddings and showers, birthdays, brand events and private gatherings, whether you're planning for
            yourself, for a business, or for clients.
          </p>
        </div>
      </section>

      <section className="container-x grid gap-5 sm:grid-cols-[1.4fr_1fr]">
        <div className="h-64 overflow-hidden rounded-3xl bg-mist md:h-[28rem]">
          <img src="https://picsum.photos/seed/hostit-about-table/1400/900" alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="h-64 overflow-hidden rounded-3xl bg-mist md:h-[28rem]">
          <img src="https://picsum.photos/seed/hostit-about-guests/900/1100" alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="container-x py-24 md:py-32">
        <span className="label-caps text-stone">how we think about it</span>
        <h2 className="mt-3 max-w-2xl text-4xl md:text-5xl">curated, local, simple.</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="border-t border-mist-deep pt-6">
              <span className="text-sm font-semibold tabular-nums text-stone">0{i + 1}</span>
              <h3 className="mt-3 text-2xl">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-mist">
        <div className="container-x grid gap-10 py-24 md:grid-cols-[1fr_1.2fr] md:gap-16 md:py-32">
          <div>
            <span className="label-caps text-stone">what curated means</span>
            <h2 className="mt-3 text-4xl md:text-5xl">every vendor, reviewed.</h2>
          </div>
          <div className="space-y-5 text-sm leading-relaxed text-stone md:text-base">
            <p>
              vendors don't simply sign up and appear. each one applies with their business profile, and the host it team
              reviews every application before a listing goes live. applying doesn't guarantee a place, and listings that no
              longer fit can be removed.
            </p>
            <p>it's how the network stays somewhere planners can trust what they find.</p>
            <Link to="/services#vendors" className="label-caps inline-block border-b border-ink pb-0.5 text-ink">
              how joining works
            </Link>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-6 pt-24 md:grid-cols-2 md:pt-32">
        <div className="card flex flex-col p-8 md:p-10">
          <span className="label-caps text-stone">planning something?</span>
          <h3 className="mt-3 text-3xl">explore the network.</h3>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            browse local vendors and experiences by category and see their work. no account needed.
          </p>
          <Link to="/network" className="pill-dark mt-8 self-start">browse the network</Link>
        </div>
        <div className="card flex flex-col p-8 md:p-10">
          <span className="label-caps text-stone">a local vendor?</span>
          <h3 className="mt-3 text-3xl">join the network.</h3>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            apply with your business profile. the host it team reviews every application before it goes live.
          </p>
          <Link to="/join" className="pill-ghost mt-8 self-start">join the network</Link>
        </div>
      </section>

      <section className="container-x grid gap-10 pt-24 md:grid-cols-[1fr_1.2fr] md:gap-16 md:pt-32">
        <div>
          <span className="label-caps text-stone">faq</span>
          <h2 className="mt-3 text-4xl md:text-5xl">frequently asked questions</h2>
        </div>
        <Faq />
      </section>
      <p className="container-x mt-10 text-center text-sm text-stone">
        questions? <Link to="/contact" className="text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink">get in touch</Link>.
      </p>
      <Footer />
    </>
  )
}
