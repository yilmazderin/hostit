import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { ListingStatus, Vendor } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { Modal } from '../../components/ui'
import { VendorProfileView } from '../../components/VendorProfileView'
import { CardPreview, ProfileForm } from '../../components/vendor/ProfileForm'
import { ListingPill } from '../../components/vendor/ListingStatus'
import { applyDraft, day, draftFields, draftOf, listingOf, submittedView } from '../../lib/application'
import { useApp } from '../../store/AppContext'

const STATUS_NOTE: Record<ListingStatus, string> = {
  draft: "the vendor is still completing their application. edits here change their draft.",
  pending: "awaiting review. edits here change the listing, not the copy of what they submitted.",
  'needs-info': 'waiting on the vendor to resubmit. they can edit the application too.',
  approved: 'approved. prepare the public profile, then publish it.',
  live: 'live in the network. saved edits are public right away.',
  rejected: "not approved. the listing isn't public.",
}

export function ListingEditor() {
  const { vendorId } = useParams()
  const { vendorById } = useApp()
  const vendor = vendorById(vendorId ?? '')
  if (!vendor) return <Navigate to="/admin" replace />
  return <Editor key={vendor.id} vendor={vendor} />
}

// Host It manages the final public listing: every field is editable here and saves straight to the record.
function Editor({ vendor }: { vendor: Vendor }) {
  const { users, overrideVendor, reviewApplication } = useApp()
  const [form, setForm] = useState(() => draftOf(vendor))
  const [flash, setFlash] = useState<string | null>(null)
  const [open, setOpen] = useState<'preview' | 'submission' | null>(null)
  const status = listingOf(vendor)
  const draft = applyDraft(vendor, form)
  const owner = users.find((u) => u.vendorId === vendor.id)
  const dirty = JSON.stringify(draftFields(vendor, form)) !== JSON.stringify(draftFields(vendor, draftOf(vendor)))

  const say = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2400)
  }
  const save = () => {
    overrideVendor(vendor.id, draftFields(vendor, form))
    say(status === 'live' ? 'saved. planners see it now.' : 'saved to the listing.')
  }
  const publish = () => {
    overrideVendor(vendor.id, draftFields(vendor, form))
    reviewApplication(vendor.id, 'publish')
    say('saved and published. the listing is live.')
  }

  return (
    <>
      <Nav />
      <section className="keep-dark bg-ink text-paper">
        <div className="container-x py-12">
          <Link to="/admin" className="label-caps text-paper/50 hover:text-paper">← applications</Link>
          <p className="label-caps mt-4 text-paper/50">edit listing</p>
          <h1 className="mt-1 break-words text-4xl normal-case md:text-5xl">{vendor.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <ListingPill status={status} />
            <span className="break-words text-xs text-paper/60">
              {owner ? owner.email : 'no vendor account'}
              {status === 'live' && vendor.publishedAt && ` · live since ${day(vendor.publishedAt)}`}
            </span>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          <ProfileForm draft={form} onChange={setForm} seed={vendor.slug} />
          <div className="flex flex-wrap items-center gap-3 border-t border-mist pt-8">
            <button className={status === 'approved' ? 'pill-ghost' : 'pill-dark'} onClick={save}>save listing</button>
            <button className="pill-ghost" onClick={() => setOpen('preview')}>preview</button>
            {flash ? (
              <span className="text-sm text-stone" role="status">{flash}</span>
            ) : (
              dirty && <span className="text-sm text-stone">unsaved changes</span>
            )}
          </div>
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-6">
          <div className="card p-6">
            <p className="label-caps text-stone">status</p>
            <ListingPill status={status} className="mt-3" />
            <p className="mt-3 text-sm text-stone">{STATUS_NOTE[status]}</p>
            {status === 'approved' && (
              <button className="pill-dark mt-5 w-full" onClick={publish}>save &amp; publish</button>
            )}
            {status === 'live' && (
              <Link to={`/vendors/${vendor.slug}`} className="label-caps mt-5 inline-block border-b border-ink pb-0.5">view live profile</Link>
            )}
            {vendor.submission && (
              <button className="mt-5 block text-sm text-stone underline hover:text-ink" onClick={() => setOpen('submission')}>
                view what they submitted
              </button>
            )}
          </div>
          <CardPreview vendor={draft} />
        </aside>
      </section>

      <Modal open={open === 'preview'} onClose={() => setOpen(null)} wide>
        <VendorProfileView vendor={draft} compact />
      </Modal>
      <Modal
        open={open === 'submission'}
        onClose={() => setOpen(null)}
        title={`what they submitted${vendor.submittedAt ? ` · ${day(vendor.submittedAt)}` : ''}`}
        wide
      >
        <VendorProfileView vendor={submittedView(vendor)} compact />
      </Modal>
      <Footer />
    </>
  )
}
