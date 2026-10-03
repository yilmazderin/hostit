import { Link } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { CategoryCard } from '../../components/cards'
import { CATEGORIES } from '../../data/categories'

// an editorial rhythm on wide screens: two wide, three tall, two wide
const layout = (i: number) =>
  i === 0
    ? { span: 'sm:col-span-2 lg:col-span-3', image: 'aspect-[4/3] sm:aspect-[16/9] lg:aspect-[3/2]' }
    : i >= 2 && i <= 4
      ? { span: 'lg:col-span-2', image: 'aspect-[4/3] sm:aspect-[4/5]' }
      : { span: 'lg:col-span-3', image: 'aspect-[4/3] sm:aspect-[4/5] lg:aspect-[3/2]' }

export function Explore() {
  return (
    <>
      <Nav dark={false} />
      <section className="container-x pt-8 md:pt-12">
        <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-4">
          <span className="label-caps text-stone">the host it network</span>
          <span className="label-caps text-stone">windsor-essex</span>
        </div>
        <div className="grid gap-10 pt-10 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-14 md:pt-14">
          <div>
            <h1 className="break-words text-balance text-5xl leading-[0.95] lg:text-6xl xl:text-7xl">the people who make it an experience.</h1>
            <p className="mt-6 max-w-md text-lg leading-snug md:text-xl">local vendors, creatives and spaces, curated for modern events.</p>
            <p className="mt-3 text-sm text-stone">browse freely, no account needed.</p>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-mist md:aspect-[4/5] lg:aspect-[5/4]">
            <img src="https://picsum.photos/seed/hostit-network/1400/1100" alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container-x pt-20 md:pt-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-t border-ink/10 pt-6">
          <h2 className="text-3xl md:text-4xl">browse by category</h2>
          <p className="text-sm text-stone">new local vendors and experiences join regularly.</p>
        </div>
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => {
            const { span, image } = layout(i)
            return <CategoryCard key={c.slug} category={c} index={i} className={span} imageClass={image} />
          })}
        </div>
      </section>

      <section className="container-x pt-24">
        <div className="flex flex-col gap-8 rounded-3xl bg-mist p-8 md:flex-row md:items-center md:justify-between md:p-14">
          <div>
            <h2 className="text-3xl md:text-4xl">not sure where to start?</h2>
            <p className="mt-3 max-w-md text-sm text-stone md:text-base">
              answer a few questions about your event and we'll match you with vendors who fit the date, the guests and the vibe.
            </p>
          </div>
          <Link to="/plan" className="pill-dark shrink-0 self-start md:self-auto">plan an event</Link>
        </div>
      </section>
      <Footer />
    </>
  )
}
