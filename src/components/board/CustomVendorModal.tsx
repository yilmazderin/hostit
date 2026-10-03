import { useState } from 'react'
import type { CategorySlug, CustomVendor, ManualStatus } from '../../types'
import { CATEGORIES } from '../../data/categories'
import { STATUS_GROUPS } from '../../lib/vendorStatus'
import { uid } from '../../store/storage'
import { Field, Modal } from '../ui'

// Add or edit a vendor from outside the Host It network. Kept to one short form on the board.
export function CustomVendorModal({
  initial,
  defaultCategory,
  onSave,
  onRemove,
  onClose,
}: {
  initial?: CustomVendor
  defaultCategory: CategorySlug
  onSave: (vendor: CustomVendor) => void
  onRemove?: () => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(() => ({
    name: initial?.name ?? '',
    categorySlug: initial?.categorySlug ?? defaultCategory,
    status: initial?.status ?? ('pending' as ManualStatus),
    contactName: initial?.contactName ?? '',
    contact: initial?.contact ?? '',
    link: initial?.link ?? '',
    notes: initial?.notes ?? '',
  }))
  const set = (patch: Partial<typeof draft>) => setDraft({ ...draft, ...patch })
  const optional = (v: string) => v.trim() || undefined

  const save = () =>
    onSave({
      id: initial?.id ?? uid('c'),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      name: draft.name.trim(),
      categorySlug: draft.categorySlug,
      status: draft.status,
      contactName: optional(draft.contactName),
      contact: optional(draft.contact),
      link: optional(draft.link),
      notes: optional(draft.notes),
    })

  return (
    <Modal open onClose={onClose} title={initial ? 'edit vendor' : 'add your own vendor'}>
      {!initial && <p className="-mt-2 mb-5 text-sm text-stone">someone you already work with. only you can see them, on this board.</p>}
      <div className="space-y-4">
        <Field label="vendor / business name">
          <input className="field h-12" autoFocus value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Rosa's Kitchen" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="category">
            <select className="field-select h-12" value={draft.categorySlug} onChange={(e) => set({ categorySlug: e.target.value as CategorySlug })}>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="status">
            <select className="field-select h-12" value={draft.status} onChange={(e) => set({ status: e.target.value as ManualStatus })}>
              {STATUS_GROUPS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
            </select>
          </Field>
          <Field label="contact name">
            <input className="field h-12" value={draft.contactName} onChange={(e) => set({ contactName: e.target.value })} placeholder="optional" />
          </Field>
          <Field label="email or phone">
            <input className="field h-12" value={draft.contact} onChange={(e) => set({ contact: e.target.value })} placeholder="optional" />
          </Field>
        </div>
        <Field label="website / instagram">
          <input className="field h-12" value={draft.link} onChange={(e) => set({ link: e.target.value })} placeholder="optional · e.g. @rosaskitchen or rosaskitchen.ca" />
        </Field>
        <Field label="notes">
          <textarea className="field min-h-20" value={draft.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="optional · quotes, what they're covering, reminders" />
        </Field>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        {onRemove ? (
          <button className="text-xs text-stone hover:text-danger" onClick={onRemove}>remove from board</button>
        ) : <span />}
        <div className="flex gap-3">
          <button className="pill-ghost" onClick={onClose}>cancel</button>
          <button className="pill-dark" disabled={!draft.name.trim()} onClick={save}>{initial ? 'save' : 'add to board'}</button>
        </div>
      </div>
    </Modal>
  )
}
