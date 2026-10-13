import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ChangeRequest, ListingStatus, Vendor } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { Field } from '../../components/ui'
import { VendorProfileView } from '../../components/VendorProfileView'
import { Checklist, ListingPill } from '../../components/vendor/ListingStatus'
import { categoryBySlug } from '../../data/categories'
import { day, listingOf } from '../../lib/application'
import { useApp, type ReviewAction } from '../../store/AppContext'

type Tab = ListingStatus | 'changes'

const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'awaiting review' },
  { key: 'needs-info', label: 'more info requested' },
  { key: 'approved', label: 'approved · preparing' },
  { key: 'live', label: 'live' },
  { key: 'rejected', label: 'not approved' },
  { key: 'draft', label: 'in progress' },
  { key: 'changes', label: 'change requests' },
]

const EMPTY: Record<ListingStatus, string> = {
  pending: 'nothing waiting on review.',
  'needs-info': 'no one is updating an application.',
  approved: 'no profiles being prepared.',
  live: 'no live listings.',
  rejected: 'nothing here.',
  draft: 'no applications in progress.',
}

const NEXT: Record<ReviewAction, ListingStatus> = {
  approve: 'approved',
  'request-info': 'needs-info',
  decline: 'rejected',
  publish: 'live',
  unpublish: 'approved',
}

// Only the statuses with a note to send get the note field.
const NOTE_HINT: Partial<Record<ListingStatus, string>> = {
  pending: 'required to request info. optional when approving. if you decline, say why.',
  'needs-info': 'optional. if you decline, say why.',
  live: 'optional. tells the vendor why their profile is going offline.',
  rejected: 'optional. sent with the approval.',
}

const STATUS_LINE: Partial<Record<ListingStatus, string>> = {
  'needs-info': 'waiting on the vendor to update their application and resubmit.',
  approved: 'prepare the public profile, then publish it. the vendor can no longer edit it.',
  live: 'public in the network. listing edits are public as soon as they are saved.',
}

const stamp = (v: Vendor) => v.review?.decidedAt ?? v.submittedAt ?? ''

// Host It's review queue and the whole network's listings: every vendor record, by status, plus change requests.
export function Applications() {
  const { vendors, users, reviewApplication, changeRequests, vendorById } = useApp()
  const [tab, setTab] = useState<Tab>('pending')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [query, setQuery] = useState('')
  const [moved, setMoved] = useState<{ id: string; to: ListingStatus } | null>(null)
  const detail = useRef<HTMLDivElement>(null)

  const count = (t: Tab) =>
    t === 'changes' ? changeRequests.filter((r) => r.status === 'open').length : vendors.filter((v) => listingOf(v) === t).length
  const inTab = tab === 'changes' ? [] : vendors.filter((v) => listingOf(v) === tab)
  const q = query.trim().toLowerCase()
  const list = inTab
    .filter((v) => !q || `${v.name} ${categoryBySlug(v.categorySlug).name} ${v.location}`.toLowerCase().includes(q))
    .sort((a, b) => stamp(b).localeCompare(stamp(a)) || a.name.localeCompare(b.name))
  const selected = list.find((v) => v.id === selectedId) ?? list[0]
  const status = selected && listingOf(selected)
  const ownerOf = (vendorId: string) => users.find((u) => u.vendorId === vendorId)
  const owner = selected && ownerOf(selected.id)
  const long = inTab.length > 8

  const openTab = (t: Tab, id: string | null = null) => {
    setTab(t)
    setSelectedId(id)
    setNote('')
    setQuery('')
    setMoved(null)
  }
  const select = (id: string) => {
    setSelectedId(id)
    setNote('')
    // stacked layout: the detail sits below the list, so bring it into view
    if (window.matchMedia('(max-width: 1023px)').matches) detail.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const act = (action: ReviewAction) => {
    if (!selected) return
    reviewApplication(selected.id, action, note)
    setMoved({ id: selected.id, to: NEXT[action] })
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
          <p className="mt-2 text-sm text-paper/70">review applications and manage every listing. nothing is public until you publish it.</p>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="mb-8 flex flex-wrap gap-1.5" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => openTab(t.key)}
              className={`chip ${tab === t.key ? 'border-ink bg-ink text-paper' : 'border-mist-deep text-ink hover:border-ink'}`}
            >
              {t.label} <span className="ml-1 opacity-60">{count(t.key)}</span>
            </button>
          ))}
        </div>

        {moved && (
          <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-mist/60 px-4 py-3 text-sm" role="status">
            <span>
              {vendorById(moved.id)?.name} moved to {TABS.find((t) => t.key === moved.to)?.label}.
            </span>
            <button className="underline" onClick={() => openTab(moved.to, moved.id)}>open</button>
          </p>
        )}

        {tab === 'changes' ? (
          <ChangeRequests />
        ) : inTab.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-mist-deep p-14 text-center text-sm text-stone">{EMPTY[tab]}</div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="min-w-0">
              {long && (
                <input
                  className="field mb-3"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="filter by name, category or place"
                  aria-label="filter vendors"
                />
              )}
              {list.length === 0 && <p className="px-1 py-4 text-sm text-stone">no matches.</p>}
              <ul className={`space-y-2 ${long ? 'max-h-[45vh] overflow-y-auto lg:max-h-[70vh] lg:pr-1' : ''}`}>
                {list.map((v) => {
                  const a = ownerOf(v.id)
                  return (
                    <li key={v.id}>
                      <button
                        onClick={() => select(v.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition-colors ${selected?.id === v.id ? 'border-ink bg-surface' : 'border-mist-deep hover:border-ink'}`}
                      >
                        <div className="truncate font-semibold">{v.name}</div>
                        <div className="mt-0.5 truncate text-xs text-stone">{categoryBySlug(v.categorySlug).name} · {v.location}</div>
                        {tab !== 'live' && (
                          <div className="mt-2 truncate text-xs text-stone">
                            {a ? `${a.name} · ` : ''}{v.submittedAt ? `submitted ${day(v.submittedAt)}` : 'not submitted yet'}
                          </div>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div ref={detail} className="min-w-0 scroll-mt-6 space-y-6">
              {selected && status && (
                <>
                  <div className="card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="break-words text-2xl normal-case">{selected.name}</h2>
                        <p className="mt-1 text-sm text-stone">{categoryBySlug(selected.categorySlug).name} · {selected.location}</p>
                        <p className="mt-1 break-words text-sm text-stone">
                          {owner ? `${owner.name} · ${owner.email}` : 'no vendor account'}
                          {selected.submittedAt && ` · submitted ${day(selected.submittedAt)}`}
                          {status === 'live' && selected.publishedAt && ` · live since ${day(selected.publishedAt)}`}
                        </p>
                      </div>
                      <ListingPill status={status} />
                    </div>

                    {status !== 'live' && <Checklist vendor={selected} className="mt-6 sm:grid-cols-2" />}
                    {selected.review && status !== 'pending' && (
                      <p className="mt-5 text-sm text-stone">
                        last update {day(selected.review.decidedAt)}
                        {selected.review.note && <> · “{selected.review.note}”</>}
                      </p>
                    )}

                    {status === 'draft' ? (
                      <p className="mt-6 rounded-xl bg-mist/60 p-4 text-sm text-stone">
                        the vendor is still completing their application. it moves to awaiting review when they submit.
                      </p>
                    ) : (
                      <div className="mt-6 border-t border-mist pt-6">
                        {STATUS_LINE[status] && <p className="mb-4 text-sm text-stone">{STATUS_LINE[status]}</p>}
                        {NOTE_HINT[status] && (
                          <Field label="note to the vendor" hint={NOTE_HINT[status]}>
                            <textarea className="field min-h-20" value={note} onChange={(e) => setNote(e.target.value)} />
                          </Field>
                        )}
                        <div className="mt-4 flex flex-wrap justify-end gap-3">
                          {status === 'pending' && (
                            <>
                              <button className="pill-ghost" onClick={() => act('decline')}>decline</button>
                              <button className="pill-ghost" disabled={!note.trim()} onClick={() => act('request-info')}>request info</button>
                              <button className="pill-dark" onClick={() => act('approve')}>approve</button>
                            </>
                          )}
                          {status === 'needs-info' && <button className="pill-ghost" onClick={() => act('decline')}>decline</button>}
                          {status === 'approved' && (
                            <>
                              <Link to={`/admin/listings/${selected.id}`} className="pill-ghost">edit listing</Link>
                              <button className="pill-dark" onClick={() => act('publish')}>publish</button>
                            </>
                          )}
                          {status === 'live' && (
                            <>
                              <Link to={`/vendors/${selected.slug}`} className="pill-ghost">view live profile</Link>
                              <Link to={`/admin/listings/${selected.id}`} className="pill-ghost">edit listing</Link>
                              <button className="pill-ghost text-danger" onClick={() => act('unpublish')}>unpublish</button>
                            </>
                          )}
                          {status === 'rejected' && <button className="pill-dark" onClick={() => act('approve')}>approve</button>}
                        </div>
                        {owner && <p className="mt-3 text-right text-xs text-stone">the vendor is notified in their portal.</p>}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="label-caps text-stone">{status === 'approved' || status === 'live' ? 'listing preview' : 'application preview'}</span>
                    <div className="card mt-3 overflow-hidden p-6">
                      <VendorProfileView key={selected.id} vendor={selected} compact />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </>
  )
}

function ChangeRequests() {
  const { changeRequests: requests, users, vendorById, resolveChangeRequest: resolve } = useApp()
  const [replies, setReplies] = useState<Record<string, string>>({})
  const open = requests.filter((r) => r.status === 'open')
  const resolved = requests.filter((r) => r.status === 'resolved')
  const from = (r: ChangeRequest) => users.find((u) => u.id === r.userId)

  return (
    <div className="max-w-3xl space-y-4">
      {open.length === 0 && (
        <div className="rounded-3xl border border-dashed border-mist-deep p-14 text-center text-sm text-stone">no open change requests.</div>
      )}
      {open.map((r) => (
        <div key={r.id} className="card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="break-words font-semibold">{vendorById(r.vendorId)?.name ?? 'unknown vendor'}</span>
            <span className="break-words text-xs text-stone">{[from(r)?.email, day(r.createdAt)].filter(Boolean).join(' · ')}</span>
          </div>
          <p className="mt-3 break-words rounded-xl bg-mist/60 p-4 text-sm">{r.message}</p>
          <div className="mt-4">
            <Field label="reply (optional)" hint="the vendor sees this in their portal.">
              <textarea
                className="field min-h-20"
                value={replies[r.id] ?? ''}
                onChange={(e) => setReplies({ ...replies, [r.id]: e.target.value })}
                placeholder="what you changed, or why not"
              />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <Link to={`/admin/listings/${r.vendorId}`} className="pill-ghost">edit listing</Link>
            <button className="pill-dark" onClick={() => resolve(r.id, replies[r.id])}>mark resolved</button>
          </div>
        </div>
      ))}
      {resolved.length > 0 && (
        <div className="pt-6">
          <p className="label-caps mb-3 text-stone">resolved</p>
          <ul className="space-y-3">
            {resolved.map((r) => (
              <li key={r.id} className="rounded-2xl border border-mist p-4 text-sm text-stone">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="break-words font-semibold">{vendorById(r.vendorId)?.name ?? 'unknown vendor'}</span>
                  <span className="text-xs">{day(r.createdAt)} · resolved {day(r.resolvedAt)}</span>
                </div>
                <p className="mt-2 break-words">{r.message}</p>
                {r.reply && <p className="mt-2 break-words">reply: {r.reply}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
