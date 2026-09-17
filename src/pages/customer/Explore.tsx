import { Footer, Nav } from '../../components/Nav'
import { CategoryCard, VendorCard } from '../../components/cards'
import { Hero, SectionTitle } from '../../components/ui'
import { CATEGORIES } from '../../data/categories'
import { useApp } from '../../store/AppContext'

export function Explore() {
  const { vendors } = useApp()
  const featured = vendors.filter((v) => v.featured).slice(0, 4)
  return (
    <>
      <Nav />
      <Hero title="explore the network" subtitle="thoughtful local vendors and experiences, all in one place." compact />
      <section className="container-x py-20">
        <SectionTitle sub="new local vendors and experiences are being added regularly.">browse by category</SectionTitle>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7 lg:gap-3">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.slug} category={c} count={vendors.filter((v) => v.categorySlug === c.slug).length} />
          ))}
        </div>
      </section>
      <section className="bg-mist">
        <div className="container-x py-20">
          <SectionTitle sub="a few we can't stop talking about.">host it picks</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
