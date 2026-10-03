import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CategorySlug, EventBoard } from '../../types'
import { CATEGORIES } from '../../data/categories'

// One dropdown for both ways onto the board: a category straight into matched results, or a vendor of your own.
export function AddVendorMenu({
  event,
  need,
  onAddOwn,
  align = 'right',
  label = '+ add vendor',
}: {
  event: EventBoard
  need: (slug: CategorySlug) => { confirmed: number; needed: number } | null
  onAddOwn: () => void
  align?: 'left' | 'right' | 'center'
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const nav = useNavigate()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // still-missing needs first, then needs already met, then everything else
  const rank = (slug: CategorySlug) => {
    const n = need(slug)
    return n ? (n.confirmed < n.needed ? 0 : 1) : 2
  }
  const cats = [...CATEGORIES].sort((a, b) => rank(a.slug) - rank(b.slug))
  const place = align === 'left' ? 'left-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0 sm:left-auto sm:right-0'

  return (
    <div ref={ref} className="relative">
      <button className="pill-dark" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        {label}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute top-full z-30 mt-2 w-[min(18rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-mist bg-surface text-left shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] ${place}`}
        >
          <div className="p-2">
            <div className="px-3 pb-2 pt-2">
              <div className="text-sm font-semibold">find a host it vendor</div>
              <div className="text-xs text-stone">matched to this event. pick a category.</div>
            </div>
            {cats.map((c) => {
              const n = need(c.slug)
              return (
                <button
                  key={c.slug}
                  role="menuitem"
                  onClick={() => nav(`/plan/results?event=${event.id}&category=${c.slug}`)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-mist"
                >
                  <span className="truncate">{c.name}</span>
                  {n && (
                    <span className={`shrink-0 text-xs tabular-nums ${n.confirmed < n.needed ? 'text-ink' : 'text-stone'}`}>
                      {n.confirmed < n.needed ? `need ${n.needed - n.confirmed}` : 'covered'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <div className="border-t border-mist p-2">
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onAddOwn()
              }}
              className="w-full rounded-xl px-3 py-2.5 text-left hover:bg-mist"
            >
              <div className="text-sm font-semibold">+ add my own vendor</div>
              <div className="text-xs text-stone">someone outside the host it network</div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
