import type { ReactNode } from 'react'
import type { CategorySlug, EventType, Vendor, VibeTag } from '../../types'
import { Chip, Field } from '../ui'
import { CATEGORIES, CATEGORY_TAGS } from '../../data/categories'
import { EVENT_TYPES, VIBE_TAGS } from '../../data/tags'
import type { ProfileDraft } from '../../lib/application'

const input = 'field disabled:cursor-default disabled:bg-mist/40'
const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

// The application fields, shared by the vendor's editor and Host It's listing editor.
// Without onChange it renders read-only: the same fields, nothing to press.
export function ProfileForm({ draft, onChange, seed }: { draft: ProfileDraft; onChange?: (d: ProfileDraft) => void; seed: string }) {
  const readOnly = !onChange
  const set = (patch: Partial<ProfileDraft>) => onChange?.({ ...draft, ...patch })
  const move = (i: number, dir: -1 | 1) => {
    const imgs = [...draft.images]
    const j = i + dir
    if (j < 0 || j >= imgs.length) return
    ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
    set({ images: imgs })
  }

  return (
    <fieldset disabled={readOnly} className="min-w-0 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="business name"><input className={`${input} h-12`} value={draft.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="category">
          <select className="field-select h-12 disabled:cursor-default disabled:bg-mist/40" value={draft.categorySlug} onChange={(e) => set({ categorySlug: e.target.value as CategorySlug })}>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="based in"><input className={`${input} h-12`} value={draft.location} onChange={(e) => set({ location: e.target.value })} /></Field>
      </div>
      <Field label="tagline"><input className={input} value={draft.tagline} onChange={(e) => set({ tagline: e.target.value })} /></Field>
      <Field label="about"><textarea className={`${input} min-h-36`} value={draft.description} onChange={(e) => set({ description: e.target.value })} /></Field>
      <Field label="services" hint={readOnly ? undefined : 'comma separated'}><input className={input} value={draft.services} onChange={(e) => set({ services: e.target.value })} /></Field>
      <Choices
        label="what you offer"
        options={CATEGORY_TAGS[draft.categorySlug]}
        chosen={draft.tags}
        onToggle={readOnly ? undefined : (t) => set({ tags: toggle(draft.tags, t) })}
        hint="planners filter your category by these. pick the ones that describe you best."
      />
      <Choices<EventType>
        label="best for"
        options={EVENT_TYPES.map((t) => t.value)}
        chosen={draft.bestFor}
        onToggle={readOnly ? undefined : (t) => set({ bestFor: toggle(draft.bestFor, t) })}
        hint="these feed the planning survey. the more accurate, the better your matches."
      />
      <Choices<VibeTag>
        label="the vibe"
        options={VIBE_TAGS}
        chosen={draft.vibes}
        onToggle={readOnly ? undefined : (t) => set({ vibes: toggle(draft.vibes, t) })}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Field label="min guests"><input className={input} type="number" value={draft.min} onChange={(e) => set({ min: Number(e.target.value) })} /></Field>
        <Field label="max guests"><input className={input} type="number" value={draft.max} onChange={(e) => set({ max: Number(e.target.value) })} /></Field>
        <Field label="instagram"><input className={input} value={draft.instagram} onChange={(e) => set({ instagram: e.target.value })} /></Field>
        <Field label="website"><input className={input} value={draft.website} onChange={(e) => set({ website: e.target.value })} /></Field>
      </div>
      <div>
        <span className="label-caps mb-2 block text-stone">gallery</span>
        {readOnly && draft.images.length === 0 ? (
          <p className="text-sm text-stone">no photos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {draft.images.map((src, i) => (
              <div key={src} className="group relative aspect-square overflow-hidden rounded-xl bg-mist">
                <img src={src} alt="" className="h-full w-full object-cover" />
                {!readOnly && (
                  <div className="keep-dark absolute inset-0 flex items-center justify-center gap-1 bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button type="button" className="rounded-full bg-paper px-2 py-1 text-xs text-ink" aria-label="move earlier" onClick={() => move(i, -1)}>←</button>
                    <button type="button" className="rounded-full bg-paper px-2 py-1 text-xs text-ink" aria-label="remove photo" onClick={() => set({ images: draft.images.filter((_, j) => j !== i) })}>✕</button>
                    <button type="button" className="rounded-full bg-paper px-2 py-1 text-xs text-ink" aria-label="move later" onClick={() => move(i, 1)}>→</button>
                  </div>
                )}
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-paper px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-ink">cover</span>}
              </div>
            ))}
            {!readOnly && (
              <button
                type="button"
                className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-mist-deep text-stone hover:border-ink hover:text-ink"
                onClick={() => set({ images: [...draft.images, `https://picsum.photos/seed/${seed}-${Date.now()}/800/600`] })}
              >
                + add
              </button>
            )}
          </div>
        )}
      </div>
    </fieldset>
  )
}

// Editable: every option, chosen ones filled. Read-only: just what was chosen.
function Choices<T extends string>({ label, options, chosen, onToggle, hint }: { label: string; options: T[]; chosen: T[]; onToggle?: (v: T) => void; hint?: string }) {
  let body: ReactNode
  if (onToggle) body = options.map((t) => <Chip key={t} active={chosen.includes(t)} onClick={() => onToggle(t)}>{t}</Chip>)
  else if (chosen.length) body = chosen.map((t) => <Chip key={t}>{t}</Chip>)
  else body = <span className="text-sm text-stone">none chosen.</span>
  return (
    <div>
      <span className="label-caps mb-2 block text-stone">{label}</span>
      <div className="flex flex-wrap gap-1.5">{body}</div>
      {onToggle && hint && <p className="mt-2 text-xs text-stone">{hint}</p>}
    </div>
  )
}

// How the business appears in category grids and survey results.
export function CardPreview({ vendor }: { vendor: Vendor }) {
  return (
    <div className="card h-fit p-6">
      <h3 className="text-lg">card preview</h3>
      <p className="mt-1 text-xs text-stone">how it appears in category grids and survey results.</p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-mist">
        <div className="flex aspect-[4/3] items-center justify-center bg-mist">
          {vendor.images[0] ? <img src={vendor.images[0]} alt="" className="h-full w-full object-cover" /> : <span className="label-caps text-stone">add a cover photo</span>}
        </div>
        <div className="p-4">
          <div className="break-words font-semibold">{vendor.name}</div>
          <div className="mt-1 text-sm text-stone">{vendor.tagline}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">{vendor.bestFor.slice(0, 3).map((t) => <Chip key={t}>{t}</Chip>)}</div>
        </div>
      </div>
    </div>
  )
}
