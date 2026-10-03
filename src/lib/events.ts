import type { EventBoard } from '../types'
import { toISODate } from './format'

// Upcoming soonest first (undated last); past most recent first. An event stays upcoming through its own day.
export function splitEvents(events: EventBoard[], today = toISODate(new Date())) {
  const upcoming = events
    .filter((e) => !e.date || e.date >= today)
    .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'))
  const past = events.filter((e) => e.date && e.date < today).sort((a, b) => b.date.localeCompare(a.date))
  return { upcoming, past }
}

export function daysUntil(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86_400_000)
}

export function countdown(iso: string) {
  if (!iso) return 'date tbd'
  const n = daysUntil(iso)
  if (n < 0) return 'past'
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n < 14) return `in ${n} days`
  if (n < 60) return `in ${Math.round(n / 7)} weeks`
  return `in ${Math.round(n / 30)} months`
}
