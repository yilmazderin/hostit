import { Link, Navigate } from 'react-router-dom'
import { Footer, Nav } from '../components/Nav'
import { useApp } from '../store/AppContext'

export function Landing() {
  const { user } = useApp()
  if (user) return <Navigate to={user.role === 'vendor' ? '/vendor' : '/home'} replace />
  return (
    <>
      <div className="relative bg-ink text-paper">
        <img src="https://picsum.photos/seed/hostit-hero/1800/1100" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/20 to-ink/60" />
        <div className="relative">
          <Nav />
          <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
            <h1 className="text-6xl md:text-8xl">make it an experience.</h1>
            <p className="mt-5 max-w-md text-sm text-paper/85 md:text-base">
              a curated network of vendors and experiences for modern events in windsor-essex.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/login?next=/explore" className="pill-light">explore vendors</Link>
              <Link to="/login?next=/plan" className="pill-ghost border-paper/50 text-paper hover:border-paper">plan an event</Link>
            </div>
          </div>
        </div>
      </div>

      <section className="container-x py-24 text-center">
        <p className="mx-auto max-w-2xl text-2xl font-medium leading-snug md:text-3xl">
          “an event is not over until everyone is done talking about it.”
        </p>
        <p className="label-caps mt-4 text-stone">mason cooley</p>
      </section>

      <section className="bg-mist">
        <div className="container-x grid gap-16 py-24 md:grid-cols-2">
          <div>
            <h2 className="text-3xl md:text-4xl">event planning, made simple.</h2>
            <p className="mt-4 text-sm leading-relaxed text-stone md:text-base">
              host it is a curated local network for discovering event vendors, services, and experiences, designed to help
              you find the people and details that bring an event to life. from weddings and showers to birthdays, brand
              events, and private gatherings, explore local vendors and experiences in one thoughtful place.
            </p>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl">
            <img src="https://picsum.photos/seed/hostit-about/1200/900" alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container-x grid gap-6 py-24 md:grid-cols-2">
        <div className="card p-10">
          <h3 className="text-2xl">are you a vendor?</h3>
          <p className="mt-3 text-sm text-stone">
            host it is growing a curated network of local event vendors and experiences. manage your profile, availability,
            and incoming event inquiries in one place.
          </p>
          <Link to="/login?role=vendor" className="pill-dark mt-6">vendor sign in</Link>
        </div>
        <div className="card p-10">
          <h3 className="text-2xl">are you planning an event?</h3>
          <p className="mt-3 text-sm text-stone">
            discover a curated network of local vendors, creatives, and experiences, all in one place. browse by category,
            answer a few questions, and pin the ones that fit your gathering to an event board.
          </p>
          <Link to="/login?role=customer" className="pill-dark mt-6">browse the network</Link>
        </div>
      </section>
      <Footer />
    </>
  )
}
