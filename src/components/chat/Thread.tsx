import { Fragment, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Conversation, EventBoard, User, Vendor } from '../../types'
import { categoryBySlug } from '../../data/categories'
import { CHAT_MAX, clock, dayLabel, sameDay, shortDate, type ChatSide } from '../../lib/chat'
import { plural } from '../../lib/format'
import { useApp } from '../../store/AppContext'
import { ChatAvatar, plannerName } from './ChatAvatar'

// messages from one side this close together read as one run: one tail, one timestamp
const RUN_GAP_MS = 5 * 60_000
const gap = (a: string, b: string) => Math.abs(Date.parse(b) - Date.parse(a))

// One conversation: who it's with, what it's about, the messages, and the box to write in.
// Without a conversation it's a new one, created when the first message is sent.
export function Thread({
  conversation,
  vendor,
  planner,
  side,
  event,
}: {
  conversation?: Conversation
  vendor: Vendor
  planner?: User
  side: ChatSide
  event?: EventBoard
}) {
  const { messagesIn, sendMessage, readConversation, awaitingReply } = useApp()
  const nav = useNavigate()
  const thread = conversation ? messagesIn(conversation.id) : []
  const typing = conversation ? awaitingReply(conversation.id) : false
  const [draft, setDraft] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const name = side === 'planner' ? vendor.name : plannerName(planner)
  const cat = categoryBySlug(vendor.categorySlug)

  // opening a conversation reads it, and so does a message arriving while it's open
  useEffect(() => {
    if (conversation) readConversation(conversation.id)
  }, [conversation?.id, thread.length])

  // stay on the newest message
  useLayoutEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [thread.length, typing])

  // the box grows with what's typed, up to about six lines
  useLayoutEffect(() => {
    const el = input.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`
  }, [draft])

  // on a phone, opening a conversation shouldn't throw the keyboard up over it
  useEffect(() => {
    if (window.matchMedia('(min-width: 768px)').matches) input.current?.focus({ preventScroll: true })
  }, [conversation?.id])

  const send = () => {
    if (!draft.trim()) return
    const target = conversation ? { conversationId: conversation.id, eventId: event?.id } : { vendorId: vendor.id, eventId: event?.id }
    const id = sendMessage(target, draft)
    if (!id) return
    setDraft('')
    if (!conversation) nav(`/chat/${id}`, { replace: true })
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // enter sends, shift+enter starts a new line; never mid-composition (e.g. a japanese ime)
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    }
  }

  const suggest = (text: string) => {
    setDraft(text)
    input.current?.focus()
  }

  const theirRead = side === 'planner' ? conversation?.vendorReadAt : conversation?.plannerReadAt
  const last = thread[thread.length - 1]
  const seen = !!last && last.from === side && !!theirRead && theirRead >= last.createdAt

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-mist px-3 py-3 md:px-6">
        <Link to="/chat" className="-ml-1 rounded-full p-2 text-stone hover:bg-mist hover:text-ink md:hidden" aria-label="back to all chats">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M10 3 5 8l5 5" />
          </svg>
        </Link>
        <ChatAvatar vendor={side === 'planner' ? vendor : undefined} planner={planner} size={40} />
        <div className="min-w-0 flex-1">
          {side === 'planner' ? (
            <Link to={`/vendors/${vendor.slug}`} className="block truncate font-semibold leading-tight hover:underline">{name}</Link>
          ) : (
            <div className="truncate font-semibold leading-tight">{name}</div>
          )}
          <div className="mt-0.5 truncate text-xs text-stone">
            {side === 'planner' ? `${cat.name} · ${vendor.location}` : `planner · writing to ${vendor.name}`}
          </div>
        </div>
      </header>

      {event && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 border-b border-mist bg-mist/40 px-4 py-2 text-xs md:px-6">
          <span className="label-caps text-stone">about</span>
          {side === 'planner' ? (
            <Link to={`/events/${event.id}`} className="font-semibold hover:underline">{event.name}</Link>
          ) : (
            <span className="font-semibold">{event.name}</span>
          )}
          <span className="text-stone">· {shortDate(event.date)} · {plural(event.guests, 'guest')}</span>
        </div>
      )}

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-6" aria-live="polite">
        {thread.length === 0 ? (
          <Intro vendor={vendor} side={side} name={name} planner={planner} event={event} onSuggest={suggest} />
        ) : (
          <ol className="flex flex-col">
            {thread.map((m, i) => {
              const prev = thread[i - 1]
              const next = thread[i + 1]
              const newDay = !prev || !sameDay(prev.createdAt, m.createdAt)
              const startsRun = newDay || prev.from !== m.from || gap(prev.createdAt, m.createdAt) > RUN_GAP_MS
              const endsRun = !next || next.from !== m.from || !sameDay(m.createdAt, next.createdAt) || gap(m.createdAt, next.createdAt) > RUN_GAP_MS
              const mine = m.from === side
              return (
                <Fragment key={m.id}>
                  {newDay && (
                    <li className="label-caps my-4 text-center text-stone first:mt-0" aria-hidden="true">
                      {dayLabel(m.createdAt)}
                    </li>
                  )}
                  <li className={`flex items-end gap-2 ${startsRun && !newDay ? 'mt-4' : 'mt-1'} ${mine ? 'justify-end' : ''}`}>
                    {!mine && (
                      <span className="w-7 shrink-0">
                        {endsRun && <ChatAvatar vendor={side === 'planner' ? vendor : undefined} planner={planner} size={28} />}
                      </span>
                    )}
                    <div className={`flex max-w-[78%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                      <p
                        className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-snug ${
                          mine ? `bg-ink text-paper ${endsRun ? 'rounded-br-md' : ''}` : `bg-mist text-ink ${endsRun ? 'rounded-bl-md' : ''}`
                        }`}
                      >
                        <span className="sr-only">{mine ? 'you' : name}: </span>
                        {m.text}
                      </p>
                      {endsRun && (
                        <span className="mt-1 px-1 text-[11px] text-stone">
                          {clock(m.createdAt)}
                          {m.auto && ' · auto-reply (demo)'}
                          {m === last && seen && ' · seen'}
                        </span>
                      )}
                    </div>
                  </li>
                </Fragment>
              )
            })}
            {typing && (
              <li className="mt-4 flex items-end gap-2">
                <span className="w-7 shrink-0">
                  <ChatAvatar vendor={vendor} size={28} />
                </span>
                <span className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-mist px-4 py-3.5" aria-label={`${name} is typing`}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="typing-dot h-1.5 w-1.5 rounded-full bg-stone" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </span>
              </li>
            )}
          </ol>
        )}
      </div>

      <form
        className="border-t border-mist p-3 md:px-6 md:py-4"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <div className="flex items-end gap-2 rounded-3xl border border-mist-deep bg-surface py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-ink">
          <textarea
            ref={input}
            rows={1}
            value={draft}
            maxLength={CHAT_MAX}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={`message ${name.toLowerCase()}`}
            aria-label={`message ${name}`}
            className="scrollbar-none min-w-0 flex-1 resize-none bg-transparent py-2 text-sm leading-snug text-ink placeholder:text-stone"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="send"
            title="send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-opacity hover:bg-ink-soft disabled:opacity-25"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

// An empty conversation: who's on the other end, and a few ways to open.
function Intro({
  vendor,
  side,
  name,
  planner,
  event,
  onSuggest,
}: {
  vendor: Vendor
  side: ChatSide
  name: string
  planner?: User
  event?: EventBoard
  onSuggest: (text: string) => void
}) {
  const cat = categoryBySlug(vendor.categorySlug)
  const ideas = [
    event ? `hi! are you available on ${shortDate(event.date)}?` : 'hi! are you taking bookings for this season?',
    event ? `what would pricing look like for ${event.guests} guests?` : 'what does pricing usually look like?',
    'what do you need from me to put together a quote?',
  ]
  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-col items-center justify-center py-6 text-center">
      <ChatAvatar vendor={side === 'planner' ? vendor : undefined} planner={planner} size={72} />
      <h2 className="mt-4 text-2xl normal-case">{name}</h2>
      <p className="mt-1 text-xs text-stone">{side === 'planner' ? `${cat.name} · ${vendor.location}` : 'planner'}</p>
      <p className="mt-4 text-sm text-stone">
        {side === 'planner' ? 'start the conversation. say hello, ask about a date, or get a quote going.' : 'no messages yet.'}
      </p>
      {side === 'planner' && (
        <div className="mt-5 flex flex-col items-center gap-2">
          {ideas.map((t) => (
            <button key={t} type="button" onClick={() => onSuggest(t)} className="chip border-mist-deep text-ink hover:border-ink">
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
