import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ListingStatus, Vendor } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { VendorProfileView } from '../../components/VendorProfileView'
import { categoryBySlug } from '../../data/categories'
import { applicationChecklist, listingOf } from '../../lib/application'
import { formatDate } from '../../lib/format'
import { useApp } from '../../store/AppContext'

const TABS: { key: ListingStatus; label: string }[] = [
  { key: 'pending', label: 'awaiting review' },
  { key: 'draft', label: 'in progress' },
  { key: 'approved', label: 'approved' },
  { key: 'rejected', label: 'not approved' },
]
const day = (iso?: string) => (iso ? formatDate(iso.slice(0, 10)) : '')

// Host It's review queue. Only businesses that came in through Join the Network appear here;
// the seeded network predates the application flow.
export function Applications() {
  const { vendors, users, reviewApplication } = useApp()
  const applications = vendors.filter((v) => v.listing !== undefined)
  const [tab, setTab] = useState<ListingStatus>('pending')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const list = applications
    .filter((v) => listingOf(v) === tab)
    .sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''))
  const selected = list.find((v) => v.id === selectedId) ?? list[0]
  const applicant = (v: Vendor) => users.find((u) => u.vendorId === v.id)

  const decide = (decision: 'approved' | 'rejected') => {
    if (!selected) return
    reviewApplication(selected.id, decision, note)
    setNote('')
    setSelectedId(null)
  }

  return (
    <>
      <Nav />
      <section className="keep-dark bg-ink text-paper">
        <div className="container-x py-12">
          <p className="label-caps text-paper/50">host it team</p>
          <h1 className="mt-2 text-4xl md:text-5xl">applications</h1>
          <p className="mt-2 text-sm text-paper/70">businesses applying to join the network. nothing is public until you approve it.</p>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="mb-8 flex flex-wrap gap-1.5" role="tablist">
          {TABS.map((t) => {
            const n = applications.filter((v) => listingOf(v) === t.key).length
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => {
                  setTab(t.key)
                  setSelectedId(null)
                  setNote('')
                }}
                className={`chip ${tab === t.key ? 'border-ink bg-ink text-paper' : 'border-mist-deep text-ink hover:border-ink'}`}
              >
                {t.label} <span className="ml-1 opacity-60">{n}</span>
              </button>
            )
          })}
        </div>

        {list.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-mist-deep p-14 text-center text-sm text-stone">
            {tab === 'pending' ? 'nothing waiting on review.' : 'nothing here.'}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <ul className="space-y-2">
              {list.map((v) => {
                const a = applicant(v)
                return (
                  <li key={v.id}>
                    <button
                      onClick={() => {
                        setSelectedId(v.id)
                        setNote('')
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition-colors ${selected?.id === v.id ? 'border-ink bg-surface' : 'border-mist-deep hover:border-ink'}`}
                    >
                      <div className="font-semibold">{v.name}</div>
                      <div className="mt-0.5 text-xs text-stone">{categoryBySlug(v.categorySlug).name} · {v.location}</div>
                      <div className="mt-2 text-xs text-stone">
                        {a ? `${a.name} · ` : ''}{v.submittedAt ? `submitted ${day(v.submittedAt)}` : 'not submitted yet'}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>

            {selected && (
              <div className="min-w-0 space-y-6">
                <div className="card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl normal-case">{selected.name}</h2>
                      <p className="mt-1 text-sm text-stone">
                        {applicant(selected)?.name} · {applicant(selected)?.email}
                        {selected.submittedAt && ` · submitted ${day(selected.submittedAt)}`}
                      </p>
                    </div>
                    {listingOf(selected) === 'approved' && (
                      <Link to={`/vendors/${selected.slug}`} className="pill-ghost">view live profile</Link>
                    )}
                  </div>
                  <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                    {applicationChecklist(selected).map((i) => (
                      <li key={i.key} className={`flex items-center gap-2 ${i.done ? '' : 'text-stone'}`}>
                        <span aria-hidden="true">{i.done ? '✓' : '○'}</span>
                        {i.label}{i.optional ? ' (optional)' : ''}
                      </li>
                    ))}
                  </ul>

                  {listingOf(selected) === 'draft' ? (
                    <p className="mt-6 rounded-xl bg-mist/60 p-4 text-sm text-stone">the applicant is still completing their profile. it'll move to awaiting review when they submit.</p>
                  ) : (
                    <div className="mt-6 border-t border-mist pt-6">
                      {selected.review && (
                        <p className="mb-4 text-sm text-stone">
                          {listingOf(selected) === 'approved' ? 'approved' : 'declined'} {day(selected.review.decidedAt)}
                          {selected.review.note && <> · “{selected.review.note}”</>}
                        </p>
                      )}
                      <label className="block">
                        <span className="label-caps mb-2 block text-stone">note to the applicant</span>
                        <textarea
                          className="field min-h-20"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder={listingOf(selected) === 'approved' ? 'why it is being removed from the network' : "optional when approving. if you decline, say why and what would change your mind."}
                        />
                      </label>
                      <div className="mt-4 flex flex-wrap justify-end gap-3">
                        {listingOf(selected) === 'approved' ? (
                          <button className="pill-ghost text-danger" onClick={() => decide('rejected')}>remove from network</button>
                        ) : (
                          <>
                            {listingOf(selected) === 'pending' && <button className="pill-ghost" onClick={() => decide('rejected')}>decline</button>}
                            <button className="pill-dark" onClick={() => decide('approved')}>approve &amp; publish</button>
                          </>
                        )}
                      </div>
                      <p className="mt-3 text-right text-xs text-stone">the applicant is notified on their dashboard either way.</p>
                    </div>
                  )}
                </div>

                <div>
                  <span className="label-caps text-stone">profile preview</span>
                  <div className="card mt-3 overflow-hidden p-6">
                    <VendorProfileView vendor={selected} compact />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      <Footer />
    </>
  )
}
