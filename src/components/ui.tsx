import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Hero({
  title,
  subtitle,
  children,
  image,
  compact,
}: {
  title: string
  subtitle?: string
  children?: ReactNode
  image?: string
  compact?: boolean
}) {
  return (
    <section className="keep-dark relative overflow-hidden bg-ink text-paper">
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          loading="eager"
        />
      )}
      <div className={`container-x relative ${compact ? 'py-16 md:py-20' : 'py-24 md:py-36'}`}>
        <h1 className="text-5xl md:text-7xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-xl text-sm text-paper/80 md:text-base">{subtitle}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  )
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl md:text-4xl">{children}</h2>
      {sub && <p className="mt-2 text-sm text-stone">{sub}</p>}
    </div>
  )
}

export function Chip({
  children,
  active,
  onClick,
  tone = 'ink',
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  tone?: 'ink' | 'paper'
}) {
  const base =
    tone === 'paper'
      ? active
        ? 'border-paper bg-paper text-ink'
        : 'border-paper/40 text-paper hover:border-paper'
      : active
        ? 'border-ink bg-ink text-paper'
        : 'border-mist-deep text-ink hover:border-ink'
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} aria-pressed={onClick ? !!active : undefined} className={`chip ${base}`}>
      {children}
    </Tag>
  )
}

type BadgeStatus = 'pending' | 'accepted' | 'declined' | 'confirmed' | 'not-contacted' | 'unavailable'

export function StatusBadge({ status, chevron }: { status: BadgeStatus; chevron?: boolean }) {
  const map: Record<BadgeStatus, string> = {
    pending: 'bg-honey/60 text-ink',
    accepted: 'bg-moss/60 text-ink',
    confirmed: 'bg-moss text-ink',
    'not-contacted': 'border border-ink/20 bg-surface text-stone',
    declined: 'bg-mist text-stone line-through',
    unavailable: 'bg-mist text-stone',
  }
  const label: Record<BadgeStatus, string> = {
    pending: 'pending',
    accepted: 'confirmed',
    confirmed: 'confirmed',
    'not-contacted': 'not contacted',
    declined: 'declined',
    unavailable: 'unavailable',
  }
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status]}`}>
      {status === 'confirmed' && (
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
      )}
      {label[status]}
      {chevron && (
        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
      )}
    </span>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-6" onClick={onClose}>
      <div
        className={`rise max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-paper p-6 md:rounded-3xl md:p-8 ${wide ? 'md:max-w-4xl' : 'md:max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          {title ? <h3 className="text-2xl">{title}</h3> : <span />}
          <button onClick={onClose} className="rounded-full p-2 text-stone hover:bg-mist hover:text-ink" aria-label="close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l10 10M13 3L3 13" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ title, sub, cta, to }: { title: string; sub?: string; cta?: string; to?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-mist-deep p-12 text-center">
      <h3 className="text-xl">{title}</h3>
      {sub && <p className="mt-2 text-sm text-stone">{sub}</p>}
      {cta && to && (
        <Link to={to} className="pill-dark mt-6">
          {cta}
        </Link>
      )}
    </div>
  )
}

export function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-mist">
        <div className="h-full rounded-full bg-ink transition-all duration-500" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <span className="label-caps text-stone">
        {step} / {total}
      </span>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label-caps mb-2 block text-stone">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone">{hint}</span>}
    </label>
  )
}
