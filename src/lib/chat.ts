import type { ChatMessage, Conversation, EventBoard, User, Vendor } from '../types'

export type ChatSide = 'planner' | 'vendor'

export const CHAT_MAX = 2000

// Which side of a conversation an account is on: the planner who started it, or the business it was sent to.
export const sideOf = (c: Conversation, user: Pick<User, 'id' | 'vendorId'>): ChatSide | null =>
  c.plannerId === user.id ? 'planner' : user.vendorId && c.vendorId === user.vendorId ? 'vendor' : null

export const threadOf = (messages: ChatMessage[], conversationId: string) => messages.filter((m) => m.conversationId === conversationId)

// messages from the other side since this side last read the conversation
export function unreadCount(c: Conversation, messages: ChatMessage[], side: ChatSide) {
  const readAt = side === 'planner' ? c.plannerReadAt : c.vendorReadAt
  return messages.filter((m) => m.conversationId === c.id && m.from !== side && (!readAt || m.createdAt > readAt)).length
}

// The POC has no server, so a vendor without a Host It account answers with a short, labelled stand-in reply.
// It stops after a few, like a real business that has taken the conversation to email.
export const AUTO_REPLIES = 4
export const autoReplyDelay = (text: string) => 1400 + Math.min(text.length * 20, 1600)

export function autoReplyText(n: number, vendor: Vendor, planner: User | undefined, event: EventBoard | undefined) {
  const first = planner?.name.split(/[\s—]/)[0].toLowerCase()
  const hi = first ? `hi ${first}!` : 'hi!'
  if (n === 0)
    return event
      ? `${hi} thanks for reaching out about ${event.name}. we'd love to be part of it. we're checking our calendar for ${shortDate(event.date)} and will get back to you shortly.`
      : `${hi} thanks for reaching out to ${vendor.name}. tell us a little about your event: the date, how many guests, and the feel you're going for.`
  if (n === 1)
    return `great question. we'll put together a quote with a couple of options${event ? ` for ${event.guests} guests` : ''} so you can compare.`
  if (n === 2) return 'sounds lovely. is there a good time this week for a quick call to go over the details?'
  return "perfect. we'll follow up by email with everything we talked about. talk soon!"
}

// "oct 24" from a yyyy-mm-dd date
export function shortDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()
}

export const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
const daysAgo = (iso: string, now: Date) => Math.round((startOfDay(now) - startOfDay(new Date(iso))) / 86_400_000)

// the time beside a conversation in the list: "2:14 pm", "yesterday", "mon", "sep 3"
export function listTime(iso: string, now = new Date()) {
  const ago = daysAgo(iso, now)
  if (ago <= 0) return clock(iso)
  if (ago === 1) return 'yesterday'
  const d = new Date(iso)
  if (ago < 7) return d.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()
}

// the divider above each day in a thread: "today", "yesterday", "friday, oct 9"
export function dayLabel(iso: string, now = new Date()) {
  const ago = daysAgo(iso, now)
  if (ago <= 0) return 'today'
  if (ago === 1) return 'yesterday'
  const d = new Date(iso)
  return d
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) })
    .toLowerCase()
}

export const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString()

export const initials = (name: string) =>
  name
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'
