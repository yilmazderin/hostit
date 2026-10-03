import { Link } from 'react-router-dom'
import type { Vendor } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { categoryBySlug } from '../../data/categories'
import { LISTING_LABEL, applicationChecklist, listingOf, readyToSubmit } from '../../lib/application'
import { formatDate } from '../../lib/format'
import { useApp } from '../../store/AppContext'

const day = (iso?: string) => (iso ? formatDate(iso.slice(0, 10)) : '')

// A vendor account whose business isn't in the network yet: draft, under review, or not approved.
export function ApplicationDashboard({ vendor }: { vendor: Vendor }) {
  const { submitApplication, notifications, markNotificationsRead } = useApp()
  const listing = listingOf(vendor)
  const checklist = applicationChecklist(vendor)
  const ready = readyToSubmit(vendor)
  const unread = notifications.filter((n) => !n.read)

  const timeline = [
    { label: 'vendor account created', done: true },
    { label: 'profile completed', done: ready },
    { label: listing === 'draft' ? 'submitted for review' : `submitted ${day(vendor.submittedAt)}`, done: listing !== 'draft' },
    { label: 'reviewed by host it', done: listing === 'rejected', current: listing === 'pending' },
    { label: 'live in the network', done: false },
  ]

  return (
    <>
      <Nav />
      <section className="keep-dark bg-ink text-paper">
        <div className="container-x flex flex-wrap items-end justify-between gap-6 py-14">
          <div>
            <p className="label-caps text-paper/50">your application · {categoryBySlug(vendor.categorySlug).name}</p>
            <h1 className="mt-2 text-4xl normal-case md:text-5xl">{vendor.name}</h1>
            <span
              className={`mt-4 inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink ${
                listing === 'pending' ? 'bg-honey' : listing === 'rejected' ? 'bg-clay' : 'bg-paper'
              }`}
            >
              {LISTING_LABEL[listing]}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/vendor/profile" className="pill-light">edit profile</Link>
            <Link to={`/vendors/${vendor.slug}`} className="pill-ghost border-paper/50 text-paper hover:border-paper">preview profile</Link>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {unread.map((n) => (
            <div key={n.id} className="card border-l-4 border-clay p-6">
              <div className="font-semibold">{n.title}</div>
              <p className="mt-1 text-sm text-stone">{n.body}</p>
              <button className="label-caps mt-3 text-stone hover:text-ink" onClick={markNotificationsRead}>dismiss</button>
            </div>
          ))}

          {listing === 'pending' ? (
            <div className="card p-6 md:p-8">
              <h2 className="text-2xl">thanks. your application is with us.</h2>
              <p className="mt-2 text-sm text-stone">
                the host it team reviews every application by hand. we'll let you know here when there's a decision.
              </p>
              <ol className="mt-6 space-y-3">
                {timeline.map((t) => (
                  <li key={t.label} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        t.done ? 'border-ink bg-ink text-paper' : t.current ? 'border-ink' : 'border-mist-deep'
                      }`}
                    >
                      {t.done && <Check />}
                      {t.current && <span className="h-2 w-2 rounded-full bg-honey" />}
                    </span>
                    <span className={t.done || t.current ? '' : 'text-stone'}>{t.label}{t.current ? ' · in progress' : ''}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="card p-6 md:p-8">
              {listing === 'rejected' ? (
                <>
                  <h2 className="text-2xl">your application wasn't approved this time.</h2>
                  {vendor.review?.note && <p className="mt-3 rounded-xl bg-mist/60 p-4 text-sm">“{vendor.review.note}” · the host it team</p>}
                  <p className="mt-3 text-sm text-stone">you're welcome to update your profile and resubmit.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl">finish your application.</h2>
                  <p className="mt-2 text-sm text-stone">complete your profile, then send it to the host it team for review. nothing is public until you're approved.</p>
                </>
              )}
              <ul className="mt-6 space-y-3">
                {checklist.map((i) => (
                  <li key={i.key} className="flex items-center gap-3 text-sm">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${i.done ? 'border-ink bg-ink text-paper' : 'border-mist-deep'}`}>
                      {i.done && <Check />}
                    </span>
                    <span className={i.done ? '' : 'text-stone'}>{i.label}{i.optional ? ' (optional)' : ''}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button className="pill-dark" disabled={!ready} onClick={() => submitApplication(vendor.id)}>
                  {listing === 'rejected' ? 'resubmit for review' : 'submit for review'}
                </button>
                {!ready && <Link to="/vendor/profile" className="text-sm underline">complete your profile</Link>}
              </div>
              <p className="mt-4 text-xs text-stone">
                submitting doesn't guarantee a place in the network. see the <Link to="/terms#vendors" className="underline">vendor terms</Link>.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg">{listing === 'pending' ? 'while you wait' : 'what you can do now'}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link to="/vendor/profile" className="font-semibold underline">edit your profile</Link>
                <span className="block text-xs text-stone">{listing === 'pending' ? 'changes go straight into your application.' : 'photos, services, who you work best with.'}</span>
              </li>
              <li>
                <Link to={`/vendors/${vendor.slug}`} className="font-semibold underline">preview your profile</Link>
                <span className="block text-xs text-stone">see it the way planners will. only you and the host it team can open it.</span>
              </li>
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-lg">unlocks when you're approved</h3>
            <ul className="mt-4 space-y-2 text-sm text-stone">
              <li>· your listing in the network and planning matches</li>
              <li>· favourites and pins from planners</li>
              <li>· event inquiries</li>
              <li>· your availability calendar</li>
            </ul>
          </div>
        </aside>
      </section>
      <Footer />
    </>
  )
}

function Check() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
  )
}
