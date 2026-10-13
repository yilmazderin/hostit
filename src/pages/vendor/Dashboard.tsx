import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ListingStatus } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { Checklist, ListingPill } from '../../components/vendor/ListingStatus'
import { categoryBySlug } from '../../data/categories'
import { LISTING_LABEL, day, listingOf } from '../../lib/application'
import { vendorCanEdit } from '../../lib/access'
import { useApp } from '../../store/AppContext'
import { unreadCount } from '../../lib/chat'

const STATUS: Record<ListingStatus, { title: string; body: string }> = {
  draft: {
    title: 'finish your application.',
    body: 'complete your application and save your progress as you go, then submit it for review. nothing is public until host it approves and publishes your listing.',
  },
  pending: {
    title: 'your application is with us.',
    body: "the host it team reviews every application by hand. it's read-only while we review it, and we'll let you know here when there's a decision.",
  },
  'needs-info': {
    title: 'host it needs a little more information.',
    body: 'update your application with what we asked for, then submit it again.',
  },
  approved: {
    title: "you're approved. your profile is being prepared.",
    body: "welcome to the host it network. we're preparing your public profile from your application and will let you know here when it's live.",
  },
  live: {
    title: 'your profile is live.',
    body: 'planners can find you in the host it network. host it manages your public profile, so to change something, send us a request.',
  },
  rejected: {
    title: "your application wasn't approved.",
    body: "we're not able to add you to the network right now. thank you for applying.",
  },
}

const STAGES = ['application', 'review', 'approved', 'live']
const STAGE_AT: Partial<Record<ListingStatus, number>> = { draft: 0, pending: 1, 'needs-info': 1, approved: 2, live: 3 }

// The vendor portal: where the application stands and what the vendor can do about it. Nothing else.
export function Dashboard() {
  const { myVendor: vendor, notifications, markNotificationsRead, changeRequests, requestChange, conversations, messagesIn } = useApp()
  const [asking, setAsking] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  if (!vendor) return null
  const status = listingOf(vendor)
  const cat = categoryBySlug(vendor.categorySlug)
  const unread = notifications.filter((n) => !n.read)
  const requests = changeRequests.filter((r) => r.vendorId === vendor.id)
  const note = vendor.review?.note
  const at = STAGE_AT[status]
  const chats = conversations.filter((c) => c.vendorId === vendor.id)
  const newChats = chats.filter((c) => unreadCount(c, messagesIn(c.id), 'vendor') > 0).length

  const send = () => {
    const err = requestChange(vendor.id, message)
    setError(err)
    if (err) return
    setMessage('')
    setAsking(false)
    setSent(true)
  }

  const preview = <Link to="/vendor/preview" className="pill-ghost">preview application</Link>
  const actions: Record<ListingStatus, ReactNode> = {
    draft: (
      <>
        <Link to="/vendor/application" className="pill-dark">complete application</Link>
        {preview}
      </>
    ),
    pending: preview,
    'needs-info': (
      <>
        <Link to="/vendor/application" className="pill-dark">edit application</Link>
        {preview}
      </>
    ),
    approved: preview,
    live: (
      <>
        <Link to={`/vendors/${vendor.slug}`} className="pill-dark">view live profile</Link>
        {preview}
        <button
          className="pill-ghost"
          disabled={asking}
          onClick={() => {
            setAsking(true)
            setSent(false)
          }}
        >
          request changes
        </button>
      </>
    ),
    rejected: (
      <>
        {preview}
        <Link to="/contact" className="text-sm underline">questions? contact host it</Link>
      </>
    ),
  }

  return (
    <>
      <Nav />
      <section className="keep-dark bg-ink text-paper">
        <div className="container-x flex items-center gap-5 py-14">
          {vendor.images[0] && <img src={vendor.images[0]} alt="" className="hidden h-20 w-20 shrink-0 rounded-2xl object-cover sm:block" />}
          <div className="min-w-0">
            <p className="label-caps text-paper/50">vendor portal · {cat.name}</p>
            <h1 className="mt-1 break-words text-4xl normal-case md:text-5xl">{vendor.name}</h1>
            <ListingPill status={status} className="mt-3" />
          </div>
        </div>
      </section>

      <section className="container-x grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <div className="min-w-0 space-y-6">
          {unread.length > 0 && (
            <div className="card border-l-4 border-ink p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="label-caps text-stone">{unread.length === 1 ? 'new update' : `${unread.length} new updates`}</p>
                <button className="label-caps text-stone hover:text-ink" onClick={markNotificationsRead}>dismiss</button>
              </div>
              <ul className="mt-3 space-y-4">
                {unread.map((n) => (
                  <li key={n.id}>
                    <div className="font-semibold">{n.title}</div>
                    <p className="mt-1 text-sm text-stone">{n.body}</p>
                    {n.to && n.to !== '/vendor' && <Link to={n.to} className="mt-1 inline-block text-sm underline">view</Link>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card p-6 md:p-8">
            <p className="label-caps text-stone">application status</p>
            <h2 className="mt-3 text-3xl">{STATUS[status].title}</h2>
            <p className="mt-3 max-w-xl text-sm text-stone">{STATUS[status].body}</p>

            {note && status === 'needs-info' && (
              <div className="mt-6 rounded-xl border-l-4 border-clay bg-mist/60 p-5">
                <p className="label-caps text-stone">what host it needs{vendor.review && ` · ${day(vendor.review.decidedAt)}`}</p>
                <p className="mt-2 text-sm">{note}</p>
              </div>
            )}
            {note && (status === 'approved' || status === 'rejected') && (
              <p className="mt-5 rounded-xl bg-mist/60 p-4 text-sm">
                “{note}” <span className="text-stone">· the host it team</span>
              </p>
            )}

            {at !== undefined && (
              <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="application progress">
                {STAGES.map((s, i) => (
                  <li key={s} aria-current={i === at ? 'step' : undefined}>
                    <div className={`h-1 rounded-full ${i <= at ? 'bg-ink' : 'bg-mist-deep'}`} />
                    <div className={`mt-2 text-[11px] leading-tight ${i === at ? 'font-semibold' : i > at ? 'text-stone' : ''}`}>
                      {s}
                      {i === at && status === 'needs-info' && <span className="block font-normal text-stone">more info needed</span>}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">{actions[status]}</div>
            {sent && <p className="mt-4 text-sm text-stone" role="status">sent. host it will review your request and reply here.</p>}

            {asking && (
              <div className="mt-6 border-t border-mist pt-6">
                <label className="block">
                  <span className="label-caps mb-2 block text-stone">what should change?</span>
                  <textarea
                    autoFocus
                    className="field min-h-28"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. please swap our cover photo and add mocktail menus to our services."
                  />
                </label>
                <p className="mt-2 text-xs text-stone">host it reviews every request and updates your public profile for you.</p>
                {error && <p className="mt-2 text-sm text-danger" role="alert">{error}</p>}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="pill-dark" onClick={send}>send request</button>
                  <button
                    className="pill-ghost"
                    onClick={() => {
                      setAsking(false)
                      setError(null)
                    }}
                  >
                    cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {vendorCanEdit(vendor) && (
            <div className="card p-6 md:p-8">
              <h3 className="text-xl">your application</h3>
              <Checklist vendor={vendor} className="mt-5" />
              <p className="mt-5 text-xs text-stone">submit from your application once everything required is ticked.</p>
            </div>
          )}

          {requests.length > 0 && (
            <div className="card p-6 md:p-8">
              <h3 className="text-xl">your change requests</h3>
              <ul className="mt-5 divide-y divide-mist">
                {requests.map((r) => (
                  <li key={r.id} className={`py-4 first:pt-0 last:pb-0 ${r.status === 'resolved' ? 'text-stone' : ''}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-stone">{day(r.createdAt)}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          r.status === 'open' ? 'bg-honey text-ink' : 'bg-mist text-stone'
                        }`}
                      >
                        {r.status === 'open' ? 'open' : `resolved ${day(r.resolvedAt)}`}
                      </span>
                    </div>
                    <p className="mt-2 break-words text-sm">{r.message}</p>
                    {r.reply && (
                      <p className="mt-3 break-words rounded-xl bg-mist/60 p-3 text-sm text-ink">
                        {r.reply} <span className="text-stone">· host it</span>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {status === 'live' && (
            <div className="card p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg">planner messages</h3>
                {newChats > 0 && <span className="rounded-full bg-honey px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">{newChats} new</span>}
              </div>
              <p className="mt-2 text-sm text-stone">
                {chats.length === 0
                  ? 'when planners message you from your profile or their event boards, the conversation lands in chat.'
                  : `${chats.length === 1 ? 'one conversation' : `${chats.length} conversations`} with planners.`}
              </p>
              <Link to="/chat" className="label-caps mt-4 inline-block border-b border-ink pb-0.5">open chat</Link>
            </div>
          )}
          <div className="card p-6">
            <h3 className="text-lg">business information</h3>
            <dl className="mt-4 divide-y divide-mist text-sm">
              <Row label="business name">{vendor.name}</Row>
              <Row label="primary category">{cat.name}</Row>
              <Row label="based in">{vendor.location}</Row>
              <Row label="status">{LISTING_LABEL[status]}</Row>
              {vendor.submittedAt && <Row label="submitted">{day(vendor.submittedAt)}</Row>}
              {status === 'live' && vendor.publishedAt && <Row label="live since">{day(vendor.publishedAt)}</Row>}
            </dl>
          </div>
          <div className="rounded-2xl bg-mist/60 p-6">
            <h3 className="text-lg">how listings work</h3>
            <p className="mt-2 text-sm text-stone">
              host it reviews every application by hand. approval means a place in the curated host it network; the host it
              team then prepares and manages your public profile.
            </p>
            <Link to="/contact" className="label-caps mt-4 inline-block border-b border-ink pb-0.5">contact host it</Link>
          </div>
        </aside>
      </section>
      <Footer />
    </>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-stone">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium">{children}</dd>
    </div>
  )
}
