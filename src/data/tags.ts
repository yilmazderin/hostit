import type { EventType, PlannerType, VibeTag } from '../types'

export const EVENT_TYPES: { value: EventType; blurb: string; emoji: string }[] = [
  { value: 'wedding', blurb: 'the big day, start to finish', emoji: '💍' },
  { value: 'shower', blurb: 'bridal, baby, or just because', emoji: '🫧' },
  { value: 'birthday', blurb: 'milestones and small ones too', emoji: '🎂' },
  { value: 'brand event', blurb: 'launches, pop-ups, activations', emoji: '✨' },
  { value: 'corporate', blurb: 'team days, client dinners, holiday', emoji: '🥂' },
  { value: 'private gathering', blurb: 'dinner parties and backyard nights', emoji: '🕯️' },
  { value: 'workshop', blurb: 'hands-on and hosted', emoji: '🎨' },
]

export const VIBE_TAGS: VibeTag[] = [
  'intimate',
  'elevated',
  'playful',
  'boho',
  'minimal',
  'moody',
  'garden',
  'glam',
  'cozy',
  'retro',
  'festive',
  'coastal',
  'rustic',
  'modern',
]

export const GUEST_PRESETS = [10, 25, 50, 100, 150, 250]

// "what best describes you?" at sign-up; the same experience for all three in V1
export const PLANNER_TYPES: { value: PlannerType; label: string }[] = [
  { value: 'self', label: 'planning an event for myself' },
  { value: 'business', label: 'planning events for a business' },
  { value: 'professional', label: 'i plan events professionally' },
]
