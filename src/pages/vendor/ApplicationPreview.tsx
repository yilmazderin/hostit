import { Link } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { VendorProfileView } from '../../components/VendorProfileView'
import { day, listingOf, submittedView } from '../../lib/application'
import { useApp } from '../../store/AppContext'

// The application as planners would see it: what was submitted when there's a frozen copy, else the draft.
export function ApplicationPreview() {
  const { myVendor: vendor } = useApp()
  if (!vendor) return null
  const status = listingOf(vendor)
  // the seeded applicant and the seeded network predate frozen submissions; their record is what was sent
  const submitted = !!vendor.submission || status === 'pending' || status === 'approved' || status === 'rejected'

  const [label, sub] = submitted
    ? [
        'your submitted application',
        `what you sent to host it${vendor.submittedAt ? ` on ${day(vendor.submittedAt)}` : ''}.${status === 'needs-info' ? ' your new edits show here once you resubmit.' : ''}`,
      ]
    : status === 'live'
      ? ['your profile on file', 'what host it has on file for you. to change it, request changes from your portal.']
      : ['draft preview', 'how planners would see your application. nothing is public until host it publishes it.']

  return (
    <>
      <Nav dark={false} />
      <div className="bg-mist/60">
        <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
          <div>
            <p className="label-caps text-ink">{label}</p>
            <p className="mt-0.5 text-xs text-stone">{sub}</p>
          </div>
          <Link to="/vendor" className="label-caps text-stone hover:text-ink">← vendor portal</Link>
        </div>
      </div>
      <VendorProfileView vendor={submittedView(vendor)} />
      <Footer />
    </>
  )
}
