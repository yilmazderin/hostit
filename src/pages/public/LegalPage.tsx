import type { ReactNode } from 'react'
import { Footer, Nav } from '../../components/Nav'
import { Hero } from '../../components/ui'

export interface LegalSection {
  id: string
  title: string
  body: ReactNode
}

// Terms and privacy share one reading layout: draft notice, contents, numbered sections.
export function LegalPage({ title, subtitle, intro, sections }: { title: string; subtitle: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <>
      <Nav />
      <Hero title={title} subtitle={subtitle} compact />
      <div className="container-x py-14 md:py-20">
        <article className="mx-auto max-w-2xl">
          <div role="note" className="rounded-2xl border border-honey bg-honey/25 p-5">
            <span className="label-caps">draft · placeholder</span>
            <p className="mt-2 text-sm leading-relaxed">
              this is placeholder text written for the host it proof of concept. it will be replaced with a version reviewed
              by legal counsel before launch. it isn't legal advice and isn't a binding agreement.
            </p>
          </div>

          <div className="mt-10 space-y-4 text-sm leading-relaxed text-ink-soft md:text-base">{intro}</div>

          <nav aria-label="on this page" className="mt-10 rounded-2xl bg-mist/60 p-6">
            <span className="label-caps text-stone">on this page</span>
            <ol className="mt-3 space-y-2 text-sm">
              {sections.map((s, i) => (
                <li key={s.id} className="flex gap-3">
                  <span className="w-5 shrink-0 tabular-nums text-stone">{i + 1}.</span>
                  <a href={`#${s.id}`} className="underline decoration-ink/20 underline-offset-2 transition-colors hover:decoration-ink">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="mt-12 scroll-mt-8 border-t border-mist pt-10">
              <h2 className="text-2xl md:text-3xl">
                <span className="text-stone">{i + 1}.</span> {s.title}
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-soft md:text-base">{s.body}</div>
            </section>
          ))}
        </article>
      </div>
      <Footer />
    </>
  )
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-stone">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
