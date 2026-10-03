import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { AddToEventModal } from '../../components/AddToEventModal'
import { VendorProfileView } from '../../components/VendorProfileView'
import { VendorCard } from '../../components/cards'
import { FavouriteButton } from '../../components/network/FavouriteButton'
import { categoryBySlug } from '../../data/categories'
import { isListed, useApp } from '../../store/AppContext'

export function VendorProfile() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const eventCtx = params.get('event') ?? undefined
  const { user, vendorBySlug, networkVendors, myEvents } = useApp()
  const [open, setOpen] = useState(false)
  const vendor = vendorBySlug(slug ?? '')
  if (!vendor) return <Navigate to="/network" replace />
  // a listing that isn't public yet can be previewed by its owner and by admins, no one else
  const preview = !isListed(vendor)
  if (preview && !(user && (user.role === 'admin' || user.vendorId === vendor.id))) return <Navigate to="/network" replace />

  const cat = categoryBySlug(vendor.categorySlug)
  const q = eventCtx ? `?event=${eventCtx}` : ''
  const onBoards = myEvents.filter((e) => e.vendorIds.includes(vendor.id))
  const related = networkVendors.filter((v) => v.categorySlug === vendor.categorySlug && v.id !== vendor.id).slice(0, 3)

  // planners add to an event; visitors are invited to sign up; vendor and admin accounts get no CTA
  const actions = !user ? (
    <>
      <Link to={`/signup?next=${encodeURIComponent(`/vendors/${vendor.slug}`)}`} className="pill-dark flex-1 text-center">
        plan with {vendor.name}
      </Link>
      <FavouriteButton vendor={vendor} variant="outline" />
      <p className="w-full text-xs text-stone">free account · takes a minute</p>
    </>
  ) : user.role === 'customer' ? (
    <>
      <button className="pill-dark flex-1" onClick={() => setOpen(true)}>add to event</button>
      <FavouriteButton vendor={vendor} variant="outline" />
      {onBoards.length > 0 && (
        <p className="w-full text-xs text-stone">
          on {onBoards.map((e) => <Link key={e.id} to={`/events/${e.id}`} className="underline">{e.name}</Link>).reduce<React.ReactNode[]>((acc, el, i) => (i ? [...acc, ', ', el] : [el]), [])}
        </p>
      )}
    </>
  ) : undefined

  return (
    <>
      <Nav dark={false} />
      {preview && (
        <div className="bg-honey/50">
          <p className="container-x label-caps py-2.5 text-ink">preview · not public yet</p>
        </div>
      )}
      <div className="container-x pt-6 md:pt-8">
        <Link to={`/network/${vendor.categorySlug}${q}`} className="label-caps text-stone hover:text-ink">← back to {cat.name}</Link>
      </div>
      <VendorProfileView vendor={vendor} actions={actions} />
      {related.length > 0 && (
        <section className="container-x pt-20 md:pt-28">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-t border-ink/10 pt-6">
            <h2 className="text-3xl">more in {cat.name}</h2>
            <Link to={`/network/${vendor.categorySlug}${q}`} className="label-caps text-stone hover:text-ink">see all →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((v) => <VendorCard key={v.id} vendor={v} to={`/vendors/${v.slug}${q}`} />)}
          </div>
        </section>
      )}
      {user?.role === 'customer' && (
        <AddToEventModal key={String(open)} vendor={vendor} open={open} onClose={() => setOpen(false)} defaultEventId={eventCtx} />
      )}
      <Footer />
    </>
  )
}
