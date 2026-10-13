import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import type { ManualStatus } from '../../types'
import { STATUS_DOT, STATUS_GROUPS, type BoardStatus, type StatusGroup } from '../../lib/vendorStatus'
import { StatusBadge } from '../ui'

const HINT: Record<StatusGroup, string> = {
  confirmed: 'booked for this event',
  pending: "you've reached out",
  'not-contacted': 'saved, not contacted yet',
  declined: "said no or isn't available",
}

const WIDTH = 240
const GAP = 6

// The status badge on a board card, opening a small menu of statuses. The menu renders in a portal,
// because the card clips anything that spills past its rounded corners.
export function StatusMenu({
  status,
  value,
  name,
  onChange,
}: {
  status: BoardStatus
  value: StatusGroup
  name: string
  onChange: (status: ManualStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const options = useRef<(HTMLButtonElement | null)[]>([])
  const current = STATUS_GROUPS.findIndex((g) => g.key === value)

  const close = (refocus = false) => {
    setOpen(false)
    setPos(null)
    if (refocus) trigger.current?.focus()
  }

  // below the badge, or above it when there's no room; never past the screen edges
  useLayoutEffect(() => {
    if (!open || !trigger.current || !menu.current) return
    const r = trigger.current.getBoundingClientRect()
    const h = menu.current.offsetHeight
    const below = r.bottom + GAP + h <= window.innerHeight - 8
    setPos({
      top: below ? r.bottom + GAP : Math.max(8, r.top - GAP - h),
      left: Math.max(8, Math.min(r.left, window.innerWidth - WIDTH - 8)),
    })
  }, [open])

  // focus the current choice once the menu is placed (it can't take focus while still hidden)
  useEffect(() => {
    if (open && pos) options.current[current]?.focus({ preventScroll: true })
  }, [open, pos !== null])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (!menu.current?.contains(t) && !trigger.current?.contains(t)) close()
    }
    // the menu is pinned to the screen, so any scroll or resize would leave it behind
    const onMove = () => close()
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open])

  const choose = (key: StatusGroup) => {
    if (key !== value) onChange(key)
    close(true)
  }

  const onKey = (e: KeyboardEvent) => {
    const at = options.current.findIndex((o) => o === document.activeElement)
    const go = (i: number) => options.current[(i + STATUS_GROUPS.length) % STATUS_GROUPS.length]?.focus()
    if (e.key === 'ArrowDown') go(at + 1)
    else if (e.key === 'ArrowUp') go(at - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(STATUS_GROUPS.length - 1)
    else if (e.key === 'Escape') close(true)
    else if (e.key === 'Tab') close()
    else return
    if (e.key !== 'Tab') e.preventDefault()
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`status for ${name}`}
        title="change status"
        className="rounded-full bg-paper transition-shadow hover:shadow-[0_0_0_1.5px_var(--color-ink)] focus-visible:shadow-[0_0_0_2px_var(--color-ink)] focus-visible:outline-none"
      >
        <StatusBadge status={status} chevron />
      </button>
      {open &&
        createPortal(
          <div
            ref={menu}
            role="listbox"
            aria-label={`status for ${name}`}
            onKeyDown={onKey}
            style={{ position: 'fixed', top: pos?.top ?? 0, left: pos?.left ?? 0, width: WIDTH, visibility: pos ? 'visible' : 'hidden' }}
            className="rise z-50 rounded-2xl border border-mist bg-surface p-1.5 text-left shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)]"
          >
            <div className="label-caps px-3 pb-1 pt-1.5 text-stone">status</div>
            {STATUS_GROUPS.map((g, i) => {
              const selected = g.key === value
              return (
                <button
                  key={g.key}
                  ref={(el) => {
                    options.current[i] = el
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(g.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left outline-none transition-colors hover:bg-mist focus-visible:bg-mist ${selected ? 'bg-mist/60' : ''}`}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[g.key]}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink">{g.label}</span>
                    <span className="block text-[11px] text-stone">{HINT[g.key]}</span>
                  </span>
                  {selected && (
                    <svg className="shrink-0 text-ink" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path d="M3 8.5l3 3 7-7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}
