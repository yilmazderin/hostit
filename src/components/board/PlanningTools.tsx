import { useState } from 'react'
import type { StickyNote, Task } from '../../types'
import { CATEGORY_BG } from '../../data/categories'
import { uid } from '../../store/storage'

const NOTE_COLORS = ['honey', 'blush', 'sky', 'moss', 'clay', 'plum']

function DeleteButton({ label, onClick, className = '' }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-full p-1.5 text-ink/50 transition-opacity hover:text-ink focus:opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 ${className}`}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l10 10M13 3L3 13" /></svg>
    </button>
  )
}

export function TodoList({ tasks, onChange }: { tasks: Task[]; onChange: (tasks: Task[]) => void }) {
  const [text, setText] = useState('')
  const left = tasks.filter((t) => !t.done).length
  const add = () => {
    const t = text.trim()
    if (!t) return
    onChange([...tasks, { id: uid('t'), text: t, done: false }])
    setText('')
  }
  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg">to-do</h3>
        {tasks.length > 0 && <span className="text-xs text-stone">{left === 0 ? 'all done' : `${left} left`}</span>}
      </div>
      {tasks.length > 0 && (
        <ul className="mt-3">
          {tasks.map((t) => (
            <li key={t.id} className="group -mx-2 flex items-start gap-1 rounded-lg px-2 hover:bg-mist/50">
              <label className="flex flex-1 cursor-pointer items-start gap-3 py-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-ink"
                  checked={t.done}
                  onChange={() => onChange(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                />
                <span className={t.done ? 'text-stone line-through' : ''}>{t.text}</span>
              </label>
              <DeleteButton label="delete task" className="mt-1.5" onClick={() => onChange(tasks.filter((x) => x.id !== t.id))} />
            </li>
          ))}
        </ul>
      )}
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <input className="field h-12" value={text} onChange={(e) => setText(e.target.value)} placeholder="add a task, e.g. call the pantry" aria-label="new task" />
        <button className="pill-dark shrink-0 px-5" disabled={!text.trim()}>add</button>
      </form>
    </div>
  )
}

export function StickyNotes({ notes, onChange }: { notes: StickyNote[]; onChange: (notes: StickyNote[]) => void }) {
  const [fresh, setFresh] = useState<string | null>(null)
  const add = () => {
    const id = uid('s')
    onChange([...notes, { id, text: '', color: NOTE_COLORS[notes.length % NOTE_COLORS.length] }])
    setFresh(id)
  }
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg">sticky notes</h3>
        <span className="text-xs text-stone">quick thoughts, links, ideas</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {notes.map((n) => (
          <div key={n.id} className={`group relative rounded-xl p-3 pr-7 ${CATEGORY_BG[n.color] ?? 'bg-honey'}`}>
            <textarea
              autoFocus={fresh === n.id}
              value={n.text}
              onChange={(e) => onChange(notes.map((x) => (x.id === n.id ? { ...x, text: e.target.value } : x)))}
              placeholder="write something..."
              aria-label="sticky note"
              className="block h-32 w-full resize-none bg-transparent text-sm leading-snug text-ink placeholder:text-ink/40"
            />
            <DeleteButton label="delete note" className="absolute right-1 top-1" onClick={() => onChange(notes.filter((x) => x.id !== n.id))} />
          </div>
        ))}
        <button
          onClick={add}
          aria-label="add a sticky note"
          className="flex min-h-[9.5rem] flex-col items-center justify-center rounded-xl border border-dashed border-mist-deep text-stone transition-colors hover:border-ink hover:text-ink"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="label-caps mt-2">note</span>
        </button>
      </div>
    </div>
  )
}
