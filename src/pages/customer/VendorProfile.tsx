import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { AddToEventModal } from '../../components/AddToEventModal'
import { VendorProfileView } from '../../components/VendorProfileView'
import { VendorCard } from '../../components/cards'
import { useApp } from '../../store/AppContext'

export function VendorProfile() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const eventCtx = params.get('event') ?? undefined
  const { vendorBySlug, vendors, myEvents } = useApp()
  const [open, setOpen] = useState(false)
  const vendor = vendorBySlug(slug ?? '')
  if (!vendor) return <Navigate to="/explore" replace />
  const onBoards = myEvents.filter((e) => e.vendorIds.includes(vendor.id))
  const related = vendors.filter((v) => v.categorySlug === vendor.categorySlug && v.id !== vendor.id).slice(0, 3)
  return (
    <>
      <Nav dark={false} />
      <div className="container-x pt-6">
        <Link to={`/explore/${vendor.categorySlug}${eventCtx ? `?event=${eventCtx}` : ''}`} className="label-caps text-stone hover:text-ink">← back</Link>
      </div>
      <VendorProfileView
        vendor={vendor}
        actions={
          <>
            <button className="pill-dark" onClick={() => setOpen(true)}>add to event</button>
            {onBoards.length > 0 && (
              <span className="self-center text-xs text-stone">
                on {onBoards.map((e) => <Link key={e.id} to={`/events/${e.id}`} className="underline">{e.name}</Link>).reduce<React.ReactNode[]>((acc, el, i) => (i ? [...acc, ', ', el] : [el]), [])}
              </span>
            )}
          </>
        }
      />
      <section className="container-x pb-8">
        <h2 className="mb-6 text-2xl">more in this category</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {related.map((v) => <VendorCard key={v.id} vendor={v} />)}
        </div>
      </section>
      <AddToEventModal key={String(open)} vendor={vendor} open={open} onClose={() => setOpen(false)} defaultEventId={eventCtx} />
      <Footer />
    </>
  )
}
