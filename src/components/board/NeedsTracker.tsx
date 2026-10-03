import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CategorySlug, EventBoard } from '../../types'
import { CATEGORIES, categoryBySlug } from '../../data/categories'

export interface NeedTally {
  confirmed: number
  considering: number
}

const MAX_COUNT = 20

// Planning progress: for each category the event needs, confirmed vendors against how many it calls for.
export function NeedsTracker({
  event,
  tally,
  activeCategory,
  onSelectCategory,
  onChange,
}: {
  event: EventBoard
  tally: (slug: CategorySlug) => NeedTally
  activeCategory: CategorySlug | null
  onSelectCategory: (slug: CategorySlug | null) => void
  onChange: (patch: Pick<EventBoard, 'needs' | 'needCounts'>) => void
}) {
  const [editing, setEditing] = useState(false)
  const rows = event.needs.map((slug) => ({ slug, needed: event.needCounts?.[slug] ?? 1, ...tally(slug) }))
  const totalNeeded = rows.reduce((n, r) => n + r.needed, 0)
  const totalFilled = rows.reduce((n, r) => n + Math.min(r.confirmed, r.needed), 0)
  const addable = CATEGORIES.filter((c) => !event.needs.includes(c.slug))

  const setCount = (slug: CategorySlug, n: number) =>
    onChange({ needs: event.needs, needCounts: { ...event.needCounts, [slug]: Math.max(1, Math.min(MAX_COUNT, n)) } })
  const remove = (slug: CategorySlug) => {
    const { [slug]: _, ...rest } = event.needCounts ?? {}
    onChange({ needs: event.needs.filter((s) => s !== slug), needCounts: rest })
    if (activeCategory === slug) onSelectCategory(null)
  }
  const add = (slug: CategorySlug) => onChange({ needs: [...event.needs, slug], needCounts: event.needCounts })

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">what you need</h2>
          <p className="mt-1 text-sm text-stone">
            {rows.length === 0
              ? 'list the categories this event still needs.'
              : editing
                ? 'set how many of each you need.'
                : <><span className="font-semibold text-ink">{totalFilled} of {totalNeeded}</span> booked · tap a category to filter your vendors</>}
          </p>
        </div>
        {(rows.length > 0 || editing) && (
          <button className="pill-ghost" onClick={() => setEditing(!editing)}>{editing ? 'done' : 'edit'}</button>
        )}
      </div>

      {rows.length === 0 && !editing ? (
        <button
          className="w-full rounded-2xl border border-dashed border-mist-deep p-6 text-sm text-stone transition-colors hover:border-ink hover:text-ink"
          onClick={() => setEditing(true)}
        >
          + add the categories you need
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]">
          {rows.map((r) => {
            const name = categoryBySlug(r.slug).name
            const done = r.confirmed >= r.needed
            const active = activeCategory === r.slug
            if (editing)
              return (
                <div key={r.slug} className="card flex items-center justify-between gap-2 p-4 text-sm">
                  <span className="min-w-0 truncate">{name}</span>
                  <div className="flex shrink-0 items-center gap-1">
                    <StepButton label={`need fewer ${name}`} disabled={r.needed <= 1} onClick={() => setCount(r.slug, r.needed - 1)}>−</StepButton>
                    <span className="w-6 text-center font-semibold tabular-nums">{r.needed}</span>
                    <StepButton label={`need more ${name}`} disabled={r.needed >= MAX_COUNT} onClick={() => setCount(r.slug, r.needed + 1)}>+</StepButton>
                    <button onClick={() => remove(r.slug)} className="ml-1 rounded-full p-1.5 text-stone hover:bg-mist hover:text-ink" aria-label={`remove ${name}`}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l10 10M13 3L3 13" /></svg>
                    </button>
                  </div>
                </div>
              )
            return (
              <div key={r.slug} className={`card p-4 transition-shadow ${active ? 'ring-2 ring-ink' : ''}`}>
                <button className="block w-full text-left" onClick={() => onSelectCategory(active ? null : r.slug)} aria-pressed={active}>
                  <span className="flex min-w-0 items-center gap-1.5 text-sm">
                    {done && (
                      <svg className="shrink-0" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                    )}
                    <span className="truncate">{name}</span>
                  </span>
                  <span className="mt-1 block text-2xl font-bold tabular-nums">{r.confirmed} / {r.needed}</span>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-moss' : 'bg-ink'}`}
                      style={{ width: `${Math.min(r.confirmed / r.needed, 1) * 100}%` }}
                    />
                  </div>
                </button>
                <div className="mt-2 flex items-baseline justify-between gap-3 text-xs text-stone">
                  <span>{done ? (r.confirmed > r.needed ? `filled · ${r.confirmed - r.needed} extra` : 'filled') : r.considering ? `${r.considering} considering` : 'still missing'}</span>
                  {!done && (
                    <Link to={`/plan/results?event=${event.id}&category=${r.slug}`} className="shrink-0 hover:text-ink hover:underline">find →</Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && addable.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="label-caps mr-1 text-stone">add</span>
          {addable.map((c) => (
            <button key={c.slug} onClick={() => add(c.slug)} className="chip border-dashed border-mist-deep text-stone hover:border-ink hover:text-ink">
              + {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-mist-deep text-sm leading-none hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-mist-deep"
    >
      {children}
    </button>
  )
}
