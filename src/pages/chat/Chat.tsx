import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { Nav } from '../../components/Nav'
import { ChatAvatar, ChatIcon, plannerName } from '../../components/chat/ChatAvatar'
import { Thread } from '../../components/chat/Thread'
import { canPlan } from '../../lib/access'
import { listTime, sideOf, unreadCount, type ChatSide } from '../../lib/chat'
import { isListed, useApp } from '../../store/AppContext'

// Chat between planners and Host It vendors. Desktop: the list beside the open conversation.
// Phones: the list, or the conversation with a way back. /chat?vendor=…&event=… opens (or starts) a chat with that vendor.
export function Chat() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { user, users, events, conversations, conversationWith, messagesIn, vendorById, awaitingReply } = useApp()
  const [filter, setFilter] = useState<'all' | ChatSide>('all')
  if (!user) return null

  const vendorParam = params.get('vendor')
  const eventParam = params.get('event') ?? undefined
  const myEvent = (eid?: string) => (eid ? events.find((e) => e.id === eid && e.ownerId === user.id) : undefined)

  // a planner who already talks to this vendor goes back to that conversation
  const existing = vendorParam ? conversationWith(vendorParam) : undefined
  if (existing) return <Navigate to={`/chat/${existing.id}${eventParam ? `?event=${eventParam}` : ''}`} replace />
  const draftVendor = vendorParam ? vendorById(vendorParam) : undefined
  const startable = !!draftVendor && isListed(draftVendor) && canPlan(user) && user.vendorId !== draftVendor.id

  const active = id ? conversations.find((c) => c.id === id) : undefined
  if (id && !active) return <Navigate to="/chat" replace />

  const rows = conversations.flatMap((c) => {
    const vendor = vendorById(c.vendorId)
    if (!vendor) return []
    const side = sideOf(c, user)!
    const thread = messagesIn(c.id)
    return [{ c, side, vendor, planner: users.find((u) => u.id === c.plannerId), last: thread[thread.length - 1], unread: unreadCount(c, thread, side) }]
  })
  // someone who both plans and runs a business can look at one side at a time
  const both = rows.some((r) => r.side === 'planner') && rows.some((r) => r.side === 'vendor')
  const shown = both && filter !== 'all' ? rows.filter((r) => r.side === filter) : rows
  const business = user.vendorId ? vendorById(user.vendorId) : undefined
  const unread = rows.filter((r) => r.unread > 0).length
  const open = !!active || startable
  const activeRow = active && rows.find((r) => r.c.id === active.id)

  return (
    <div className="flex h-dvh flex-col">
      <Nav />
      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 md:px-10 md:py-6">
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden md:card">
          <aside className={`${open ? 'hidden md:flex' : 'flex'} min-h-0 w-full flex-col md:w-80 md:shrink-0 md:border-r md:border-mist`}>
            <div className="flex items-baseline justify-between gap-3 px-5 pb-3 pt-5">
              <h1 className="text-3xl">chat</h1>
              {unread > 0 && <span className="label-caps text-stone">{unread} new</span>}
            </div>
            {both && (
              <div className="flex gap-1.5 overflow-x-auto px-5 pb-3 scrollbar-none" role="group" aria-label="show">
                {(['all', 'planner', 'vendor'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                    className={`chip shrink-0 ${filter === f ? 'border-ink bg-ink text-paper' : 'border-mist-deep text-ink hover:border-ink'}`}
                  >
                    {f === 'all' ? 'all' : f === 'planner' ? 'planning' : business?.name.toLowerCase() ?? 'your business'}
                  </button>
                ))}
              </div>
            )}
            <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
              {startable && !active && draftVendor && (
                <li>
                  <div className="flex items-center gap-3 rounded-xl bg-mist px-3 py-3" aria-current="true">
                    <ChatAvatar vendor={draftVendor} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold leading-tight">{draftVendor.name}</div>
                      <div className="mt-0.5 text-xs text-stone">new message</div>
                    </div>
                  </div>
                </li>
              )}
              {shown.map((r) => {
                const isActive = r.c.id === active?.id
                const name = r.side === 'planner' ? r.vendor.name : plannerName(r.planner)
                const typing = awaitingReply(r.c.id)
                const event = events.find((e) => e.id === r.c.eventId)
                return (
                  <li key={r.c.id}>
                    <Link
                      to={`/chat/${r.c.id}`}
                      aria-current={isActive ? 'true' : undefined}
                      className={`flex gap-3 rounded-xl px-3 py-3 transition-colors ${isActive ? 'bg-mist' : 'hover:bg-mist/60'}`}
                    >
                      <ChatAvatar vendor={r.side === 'planner' ? r.vendor : undefined} planner={r.planner} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`truncate leading-tight ${r.unread ? 'font-bold' : 'font-semibold'}`}>{name}</span>
                          {r.last && <span className={`shrink-0 text-[11px] ${r.unread ? 'font-semibold text-ink' : 'text-stone'}`}>{listTime(r.last.createdAt)}</span>}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className={`min-w-0 flex-1 truncate text-sm ${r.unread ? 'text-ink' : 'text-stone'}`}>
                            {typing ? <em className="not-italic text-stone">typing…</em> : r.last ? `${r.last.from === r.side ? 'you: ' : ''}${r.last.text}` : 'no messages yet'}
                          </span>
                          {r.unread > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-honey px-1.5 text-[10px] font-bold text-ink" aria-label={`${r.unread} unread`}>
                              {r.unread}
                            </span>
                          )}
                        </div>
                        {(event || (both && r.side === 'vendor')) && (
                          <div className="mt-1 truncate text-[11px] text-stone">
                            {both && r.side === 'vendor' && <span className="font-semibold text-ink">{r.vendor.name.toLowerCase()}</span>}
                            {both && r.side === 'vendor' && event && ' · '}
                            {event?.name}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
              {rows.length === 0 && !startable && (
                <li className="px-3 py-6">
                  <p className="text-sm text-stone">
                    {business && user.role === 'vendor'
                      ? `no messages yet. when planners write to ${business.name.toLowerCase()}, you'll see them here.`
                      : 'no conversations yet. message a vendor from their profile or from your event board.'}
                  </p>
                  <Link to="/network" className="label-caps mt-4 inline-block border-b border-ink pb-0.5">browse the network</Link>
                </li>
              )}
            </ul>
          </aside>

          <section className={`${open ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1`} aria-label="conversation">
            {active && activeRow ? (
              <Thread
                key={active.id}
                conversation={active}
                vendor={activeRow.vendor}
                planner={activeRow.planner}
                side={activeRow.side}
                event={activeRow.side === 'planner' ? myEvent(eventParam) ?? myEvent(active.eventId) : events.find((e) => e.id === active.eventId)}
              />
            ) : startable && draftVendor ? (
              <Thread key={`new-${draftVendor.id}`} vendor={draftVendor} side="planner" event={myEvent(eventParam)} />
            ) : (
              <div className="m-auto max-w-xs px-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mist text-stone">
                  <ChatIcon size={22} />
                </span>
                <h2 className="mt-4 text-xl">your conversations</h2>
                <p className="mt-2 text-sm text-stone">pick a chat on the left, or message a vendor from their profile.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
