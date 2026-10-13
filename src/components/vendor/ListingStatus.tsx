import type { ListingStatus, Vendor } from '../../types'
import { LISTING_LABEL, applicationChecklist } from '../../lib/application'

const TONE: Record<ListingStatus, string> = {
  draft: 'bg-mist text-ink',
  pending: 'bg-honey text-ink',
  'needs-info': 'bg-clay text-ink',
  approved: 'bg-sky text-ink',
  live: 'bg-moss text-ink',
  rejected: 'bg-mist text-stone',
}

export function ListingPill({ status, className = '' }: { status: ListingStatus; className?: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${TONE[status]} ${className}`}>
      {LISTING_LABEL[status]}
    </span>
  )
}

export function Checklist({ vendor, className = '' }: { vendor: Vendor; className?: string }) {
  return (
    <ul className={`grid gap-3 text-sm ${className}`}>
      {applicationChecklist(vendor).map((i) => (
        <li key={i.key} className="flex items-center gap-3">
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${i.done ? 'border-ink bg-ink text-paper' : 'border-mist-deep'}`}>
            {i.done && <Check />}
          </span>
          <span className={i.done ? '' : 'text-stone'}>{i.label}{i.optional ? ' (optional)' : ''}</span>
        </li>
      ))}
    </ul>
  )
}

function Check() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
  )
}
