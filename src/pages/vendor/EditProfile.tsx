import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ListingStatus } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { Modal } from '../../components/ui'
import { VendorProfileView } from '../../components/VendorProfileView'
import { CardPreview, ProfileForm } from '../../components/vendor/ProfileForm'
import { Checklist, ListingPill } from '../../components/vendor/ListingStatus'
import { applyDraft, day, draftFields, draftOf, listingOf, readyToSubmit, submittedView } from '../../lib/application'
import { vendorCanEdit } from '../../lib/access'
import { useApp } from '../../store/AppContext'

const LOCKED: Record<Exclude<ListingStatus, 'draft' | 'needs-info'>, ReactNode> = {
  pending: "your application is with the host it team. it's read-only while we review it, and we'll let you know in your portal.",
  approved: "you're approved. host it is preparing your public profile from this application, so it can't be changed here.",
  live: (
    <>
      your profile is live and managed by host it. to change something,{' '}
      <Link to="/vendor" className="underline">request changes from your portal</Link>.
    </>
  ),
  rejected: (
    <>
      this application wasn't approved, so it's closed for editing. questions? <Link to="/contact" className="underline">contact host it</Link>.
    </>
  ),
}

// The vendor's application: editable before submitting or when Host It asks for more, read-only otherwise.
export function EditProfile() {
  const { myVendor: vendor, overrideVendor, submitApplication } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(() => vendor && draftOf(vendor))
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // submitApplication freezes the record as its render sees it, so it waits for the save to land first
  useEffect(() => {
    if (!submitting || !vendor) return
    submitApplication(vendor.id)
    navigate('/vendor')
  }, [submitting])

  if (!vendor || !form) return null
  const status = listingOf(vendor)
  const editable = vendorCanEdit(vendor)
  const draft = applyDraft(vendor, form)
  const shown = editable ? draft : submittedView(vendor)
  const ready = readyToSubmit(draft)

  const save = () => {
    overrideVendor(vendor.id, draftFields(vendor, form))
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }
  const submit = () => {
    overrideVendor(vendor.id, draftFields(vendor, form))
    setSubmitting(true)
  }

  return (
    <>
      <Nav />
      <section className="keep-dark bg-ink text-paper">
        <div className="container-x py-12">
          <Link to="/vendor" className="label-caps text-paper/50 hover:text-paper">← vendor portal</Link>
          <h1 className="mt-2 text-4xl md:text-5xl">your application</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <ListingPill status={status} />
            {vendor.submittedAt && <span className="text-xs text-paper/60">submitted {day(vendor.submittedAt)}</span>}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          {status === 'needs-info' && (
            <div className="card border-l-4 border-clay p-6">
              <p className="label-caps text-stone">what host it needs</p>
              <p className="mt-2 text-sm">{vendor.review?.note ?? 'a little more information. update your application, then submit it again.'}</p>
            </div>
          )}
          {!editable && <p className="rounded-2xl bg-mist/60 p-4 text-sm text-stone">{LOCKED[status as keyof typeof LOCKED]}</p>}

          {editable ? <ProfileForm draft={form} onChange={setForm} seed={vendor.slug} /> : <ProfileForm draft={draftOf(shown)} seed={vendor.slug} />}

          {editable ? (
            <div className="border-t border-mist pt-8">
              <h2 className="text-2xl">before you submit</h2>
              <Checklist vendor={draft} className="mt-5" />
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button className="pill-ghost" onClick={save}>save progress</button>
                <button className="pill-ghost" onClick={() => setPreview(true)}>preview</button>
                <button className="pill-dark" disabled={!ready} onClick={submit}>
                  {status === 'needs-info' ? 'resubmit for review' : 'submit for review'}
                </button>
                {saved && <span className="text-sm text-stone" role="status">saved to your application.</span>}
              </div>
              <p className="mt-4 text-xs text-stone">
                once submitted, your application is read-only while host it reviews it. submitting doesn't guarantee a place
                in the network. see the <Link to="/terms#vendors" className="underline">vendor terms</Link>.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 border-t border-mist pt-8">
              <Link to="/vendor/preview" className="pill-ghost">preview application</Link>
              <Link to="/vendor" className="pill-dark">back to your portal</Link>
            </div>
          )}
        </div>
        <aside className="h-fit lg:sticky lg:top-6">
          <CardPreview vendor={shown} />
        </aside>
      </section>
      <Modal open={preview} onClose={() => setPreview(false)} wide>
        <VendorProfileView vendor={draft} compact />
      </Modal>
      <Footer />
    </>
  )
}
