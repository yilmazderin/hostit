import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type {
  CategorySlug,
  ChangeRequest,
  ListingStatus,
  ResetToken,
  EventBoard,
  EventType,
  Inquiry,
  InquiryStatus,
  Notification,
  PlannerType,
  User,
  Vendor,
  VendorOverride,
  VibeTag,
} from '../types'
import { SEED_APPLICANTS, USERS } from '../data/users'
import { VENDORS } from '../data/vendors'
import { SEED_EVENTS, SEED_INQUIRIES } from '../data/seed'
import { listingOf, vendorCanEdit } from '../lib/access'
import { isEmail } from '../lib/validate'
import { clear, load, save, uid } from './storage'

interface State {
  sessionUserId: string | null
  accounts: User[]
  events: EventBoard[]
  inquiries: Inquiry[]
  vendorOverrides: Record<string, VendorOverride>
  applicants: Vendor[] // vendor records created through Join the Network
  favourites: Record<string, string[]> // userId -> vendorIds
  notifications: Notification[]
  changeRequests: ChangeRequest[]
  resetTokens: ResetToken[]
  resetRequests: { email: string; at: string }[] // every request, known email or not, for rate limiting
  schema: number
}

const SCHEMA = 2

const initial = (): State => ({
  sessionUserId: null,
  accounts: USERS,
  events: SEED_EVENTS,
  inquiries: SEED_INQUIRIES,
  vendorOverrides: {},
  applicants: SEED_APPLICANTS,
  favourites: { 'u-maya': ['v-the-pantry', 'v-lindsays-florals', 'v-dj-soleil'] },
  notifications: [],
  changeRequests: [],
  resetTokens: [],
  resetRequests: [],
  schema: SCHEMA,
})

// Saved demo data from before v1.1 had no "published" step: an approved listing was already public.
// Keep those public as "live" and add the new collections, so nobody loses accounts, boards or applications.
function migrate(saved: State | null): State | null {
  if (!saved) return saved
  const live = <T extends { listing?: ListingStatus }>(v: T): T => ((v.listing as string) === 'approved' ? { ...v, listing: 'live' } : v)
  const v1 = (saved.schema ?? 1) < 2
  // collections added after a save was written start empty
  return {
    ...saved,
    vendorOverrides: v1 ? Object.fromEntries(Object.entries(saved.vendorOverrides).map(([k, o]) => [k, live(o)])) : saved.vendorOverrides,
    applicants: v1 ? saved.applicants.map(live) : saved.applicants,
    changeRequests: saved.changeRequests ?? [],
    resetTokens: saved.resetTokens ?? [],
    resetRequests: saved.resetRequests ?? [],
    schema: SCHEMA,
  }
}

// seeded vendors carry no listing field; they're the live network
export const isListed = (v: Vendor) => listingOf(v) === 'live'

export type ReviewAction = 'approve' | 'request-info' | 'decline' | 'publish' | 'unpublish'
export type ResetStatus = 'valid' | 'used' | 'expired' | 'invalid'

const RESET_TTL_MS = 30 * 60_000
const RESET_WINDOW_MS = 15 * 60_000
const RESET_MAX_PER_WINDOW = 3
const RESET_COOLDOWN_MS = 60_000
const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, '0')).join('')

type Action =
  | { type: 'login'; userId: string }
  | { type: 'logout' }
  | { type: 'reset' }
  | { type: 'createEvent'; event: EventBoard }
  | { type: 'updateEvent'; id: string; patch: Partial<EventBoard> }
  | { type: 'deleteEvent'; id: string }
  | { type: 'addVendors'; eventId: string; vendorIds: string[]; customerId: string; message?: string; contact: boolean }
  | { type: 'contactVendor'; eventId: string; vendorId: string; customerId: string }
  | { type: 'removeVendor'; eventId: string; vendorId: string }
  | { type: 'setInquiryStatus'; id: string; status: InquiryStatus }
  | { type: 'overrideVendor'; vendorId: string; patch: VendorOverride }
  | { type: 'signUp'; user: User; vendor?: Vendor }
  | { type: 'updateAccount'; id: string; patch: Partial<User> }
  | { type: 'toggleFavourite'; userId: string; vendorId: string }
  | { type: 'notify'; notification: Notification }
  | { type: 'readNotifications'; userId: string }
  | { type: 'startApplication'; userId: string; vendor: Vendor }
  | { type: 'requestChange'; request: ChangeRequest }
  | { type: 'resolveChange'; id: string; reply?: string }
  | { type: 'issueResetToken'; token: ResetToken }
  | { type: 'logResetRequest'; email: string }
  | { type: 'useResetToken'; token: string; password: string }

const inquiryMessage = (event: EventBoard) =>
  `hi! planning ${event.name} (${event.type}, ${event.guests} guests) on ${event.date}. would love to work with you.`

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'login':
      return { ...state, sessionUserId: action.userId }
    case 'logout':
      return { ...state, sessionUserId: null }
    case 'reset':
      return initial()
    case 'createEvent':
      return { ...state, events: [action.event, ...state.events] }
    case 'updateEvent':
      return {
        ...state,
        events: state.events.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)),
      }
    case 'deleteEvent':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.id),
        inquiries: state.inquiries.filter((i) => i.eventId !== action.id),
      }
    case 'addVendors': {
      const event = state.events.find((e) => e.id === action.eventId)
      if (!event) return state
      const fresh = action.vendorIds.filter((id) => !event.vendorIds.includes(id))
      if (fresh.length === 0) return state
      const now = new Date().toISOString()
      // without contact the vendors are only pinned: "not contacted" until an inquiry goes out
      const inquiries = !action.contact ? [] : fresh.map<Inquiry>((vendorId) => ({
        id: uid('i'),
        eventId: event.id,
        vendorId,
        customerId: action.customerId,
        message: action.message ?? inquiryMessage(event),
        status: 'pending',
        createdAt: now,
      }))
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === event.id ? { ...e, vendorIds: [...e.vendorIds, ...fresh] } : e,
        ),
        inquiries: [...inquiries, ...state.inquiries],
      }
    }
    case 'contactVendor': {
      const event = state.events.find((e) => e.id === action.eventId)
      if (!event || !event.vendorIds.includes(action.vendorId)) return state
      if (state.inquiries.some((i) => i.eventId === event.id && i.vendorId === action.vendorId)) return state
      const inquiry: Inquiry = {
        id: uid('i'),
        eventId: event.id,
        vendorId: action.vendorId,
        customerId: action.customerId,
        message: inquiryMessage(event),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      return { ...state, inquiries: [inquiry, ...state.inquiries] }
    }
    case 'removeVendor':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.eventId
            ? { ...e, vendorIds: e.vendorIds.filter((v) => v !== action.vendorId) }
            : e,
        ),
        inquiries: state.inquiries.filter(
          (i) => !(i.eventId === action.eventId && i.vendorId === action.vendorId),
        ),
      }
    case 'setInquiryStatus':
      return {
        ...state,
        inquiries: state.inquiries.map((i) =>
          i.id === action.id ? { ...i, status: action.status } : i,
        ),
      }
    case 'overrideVendor':
      return {
        ...state,
        vendorOverrides: {
          ...state.vendorOverrides,
          [action.vendorId]: { ...state.vendorOverrides[action.vendorId], ...action.patch },
        },
      }
    case 'signUp':
      return {
        ...state,
        accounts: [...state.accounts, action.user],
        applicants: action.vendor ? [...state.applicants, action.vendor] : state.applicants,
        sessionUserId: action.user.id,
      }
    case 'updateAccount':
      return { ...state, accounts: state.accounts.map((u) => (u.id === action.id ? { ...u, ...action.patch } : u)) }
    case 'toggleFavourite': {
      const mine = state.favourites[action.userId] ?? []
      const next = mine.includes(action.vendorId) ? mine.filter((v) => v !== action.vendorId) : [...mine, action.vendorId]
      return { ...state, favourites: { ...state.favourites, [action.userId]: next } }
    }
    case 'notify':
      return { ...state, notifications: [action.notification, ...state.notifications] }
    case 'readNotifications':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.userId === action.userId ? { ...n, read: true } : n)),
      }
    case 'startApplication':
      return {
        ...state,
        applicants: [...state.applicants, action.vendor],
        accounts: state.accounts.map((u) => (u.id === action.userId ? { ...u, vendorId: action.vendor.id, lastDashboard: 'vendor' } : u)),
      }
    case 'requestChange':
      return { ...state, changeRequests: [action.request, ...state.changeRequests] }
    case 'resolveChange':
      return {
        ...state,
        changeRequests: state.changeRequests.map((r) =>
          r.id === action.id ? { ...r, status: 'resolved', resolvedAt: new Date().toISOString(), reply: action.reply } : r,
        ),
      }
    case 'logResetRequest': {
      // keep only the last window's worth; that's all the limit ever reads
      const cutoff = Date.now() - RESET_WINDOW_MS
      const kept = state.resetRequests.filter((r) => Date.parse(r.at) >= cutoff)
      return { ...state, resetRequests: [...kept, { email: action.email, at: new Date().toISOString() }] }
    }
    case 'issueResetToken':
      return { ...state, resetTokens: [action.token, ...state.resetTokens] }
    case 'useResetToken': {
      const t = state.resetTokens.find((r) => r.token === action.token)
      if (!t) return state
      const now = new Date().toISOString()
      return {
        ...state,
        accounts: state.accounts.map((u) => (u.id === t.userId ? { ...u, password: action.password } : u)),
        // one reset spends every outstanding link for that account
        resetTokens: state.resetTokens.map((r) => (r.userId === t.userId && !r.usedAt ? { ...r, usedAt: now } : r)),
      }
    }
    default:
      return state
  }
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  plannerType?: PlannerType
  // present for Join the Network: the business behind the account, created as a draft listing
  business?: Pick<Vendor, 'name' | 'categorySlug' | 'location'>
}

const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export interface NewEventInput {
  name: string
  type: EventType
  guests: number
  date: string
  time?: string
  location?: string
  vibes?: VibeTag[]
  needs?: CategorySlug[]
}

const COVERS = ['moss', 'blush', 'sky', 'plum', 'honey', 'clay', 'slate', 'sand']

interface Ctx {
  user: User | null
  users: User[]
  vendors: Vendor[] // every vendor record, applicants included
  networkVendors: Vendor[] // only what the public network shows
  events: EventBoard[]
  myEvents: EventBoard[]
  inquiries: Inquiry[]
  login: (email: string, password: string) => User | null
  logout: () => void
  resetDemo: () => void
  signUp: (input: SignUpInput) => { user?: User; error?: string }
  updateAccount: (patch: Partial<Pick<User, 'name' | 'email' | 'password' | 'plannerType'>>) => string | null
  favourites: string[]
  isFavourite: (vendorId: string) => boolean
  toggleFavourite: (vendorId: string) => void
  notifications: Notification[]
  markNotificationsRead: () => void
  myVendor: Vendor | undefined // the signed-in account's own vendor record, if it has applied
  startVendorApplication: (business: Pick<Vendor, 'name' | 'categorySlug' | 'location'>) => { vendor?: Vendor; error?: string }
  setLastDashboard: (where: 'planning' | 'vendor') => void
  submitApplication: (vendorId: string) => void
  reviewApplication: (vendorId: string, action: ReviewAction, note?: string) => void
  changeRequests: ChangeRequest[] // admin: all; everyone else: their own
  requestChange: (vendorId: string, message: string) => string | null
  resolveChangeRequest: (id: string, reply?: string) => void
  requestPasswordReset: (email: string) => { link?: string; error?: string }
  checkResetToken: (token: string) => ResetStatus
  resetPassword: (token: string, password: string) => string | null
  createEvent: (input: NewEventInput) => EventBoard
  updateEvent: (id: string, patch: Partial<EventBoard>) => void
  deleteEvent: (id: string) => void
  addVendorsToEvent: (eventId: string, vendorIds: string[], message?: string, contact?: boolean) => void
  contactVendor: (eventId: string, vendorId: string) => void
  removeVendorFromEvent: (eventId: string, vendorId: string) => void
  setInquiryStatus: (id: string, status: InquiryStatus) => void
  overrideVendor: (vendorId: string, patch: VendorOverride) => void
  vendorById: (id: string) => Vendor | undefined
  vendorBySlug: (slug: string) => Vendor | undefined
  inquiryFor: (eventId: string, vendorId: string) => Inquiry | undefined
}

const AppContext = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => migrate(load<State>()) ?? initial())

  useEffect(() => {
    save(state)
  }, [state])

  const vendors = useMemo(
    () => [...VENDORS, ...state.applicants].map((v) => ({ ...v, ...(state.vendorOverrides[v.id] ?? {}) })),
    [state.vendorOverrides, state.applicants],
  )
  const networkVendors = useMemo(() => vendors.filter(isListed), [vendors])

  const user = useMemo(
    () => state.accounts.find((u) => u.id === state.sessionUserId) ?? null,
    [state.accounts, state.sessionUserId],
  )
  const favourites = user ? state.favourites[user.id] ?? [] : []
  const myVendor = user?.vendorId ? vendors.find((v) => v.id === user.vendorId) : undefined
  const isAdmin = user?.role === 'admin'
  const notify = (userId: string, title: string, body: string, to: string) =>
    dispatch({ type: 'notify', notification: { id: uid('n'), userId, createdAt: new Date().toISOString(), read: false, to, title, body } })
  const ownerOf = (vendorId: string) => state.accounts.find((u) => u.vendorId === vendorId)
  const draftVendor = (business: Pick<Vendor, 'name' | 'categorySlug' | 'location'>): Vendor => {
    const base = slugify(business.name) || 'vendor'
    const slug = vendors.some((v) => v.slug === base) ? `${base}-${uid('x').slice(-4)}` : base
    return {
      id: `v-${slug}`,
      slug,
      name: business.name.trim(),
      categorySlug: business.categorySlug,
      location: business.location.trim() || 'Windsor, ON',
      tagline: '',
      description: '',
      services: [],
      bestFor: [],
      vibes: [],
      guestRange: { min: 10, max: 100 },
      unavailableDates: [],
      images: [],
      tags: [],
      listing: 'draft',
    }
  }
  const emailTaken = (email: string, exceptId?: string) =>
    state.accounts.some((u) => u.id !== exceptId && u.email.toLowerCase() === email.trim().toLowerCase())

  const myEvents = useMemo(
    () => (user ? state.events.filter((e) => e.ownerId === user.id) : []),
    [state.events, user],
  )

  const value: Ctx = {
    user,
    users: state.accounts,
    vendors,
    networkVendors,
    events: state.events,
    myEvents,
    inquiries: state.inquiries,
    login: (email, password) => {
      const found = state.accounts.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      )
      if (found) dispatch({ type: 'login', userId: found.id })
      return found ?? null
    },
    logout: () => dispatch({ type: 'logout' }),
    resetDemo: () => {
      clear()
      dispatch({ type: 'reset' })
    },
    signUp: (input) => {
      const email = input.email.trim()
      if (!input.name.trim()) return { error: 'add your name.' }
      if (!isEmail(email)) return { error: "that email doesn't look right." }
      if (emailTaken(email)) return { error: 'an account with that email already exists. try logging in.' }
      if (input.password.length < 8) return { error: 'use at least 8 characters for your password.' }
      const now = new Date().toISOString()
      const vendor = input.business ? draftVendor(input.business) : undefined
      const user: User = {
        id: uid('u'),
        role: vendor ? 'vendor' : 'customer',
        name: input.name.trim(),
        email,
        password: input.password,
        plannerType: vendor ? undefined : input.plannerType,
        vendorId: vendor?.id,
        termsAcceptedAt: now,
        createdAt: now,
        lastDashboard: vendor ? 'vendor' : 'planning',
      }
      dispatch({ type: 'signUp', user, vendor })
      return { user }
    },
    updateAccount: (patch) => {
      if (!user) return 'not signed in.'
      if (patch.email !== undefined) {
        if (!isEmail(patch.email)) return "that email doesn't look right."
        if (emailTaken(patch.email, user.id)) return 'another account already uses that email.'
      }
      if (patch.password !== undefined && patch.password.length < 8) return 'use at least 8 characters for your password.'
      dispatch({ type: 'updateAccount', id: user.id, patch: patch.email ? { ...patch, email: patch.email.trim() } : patch })
      return null
    },
    favourites,
    isFavourite: (vendorId) => favourites.includes(vendorId),
    toggleFavourite: (vendorId) => {
      if (user) dispatch({ type: 'toggleFavourite', userId: user.id, vendorId })
    },
    notifications: user ? state.notifications.filter((n) => n.userId === user.id) : [],
    markNotificationsRead: () => {
      if (user) dispatch({ type: 'readNotifications', userId: user.id })
    },
    myVendor,
    startVendorApplication: (business) => {
      if (!user || isAdmin) return { error: 'sign in to apply.' }
      if (user.vendorId) return { error: 'this account already has a vendor application.' }
      if (!business.name.trim()) return { error: 'add your business name.' }
      const vendor = draftVendor(business)
      dispatch({ type: 'startApplication', userId: user.id, vendor })
      return { vendor }
    },
    setLastDashboard: (where) => {
      if (user && user.lastDashboard !== where) dispatch({ type: 'updateAccount', id: user.id, patch: { lastDashboard: where } })
    },
    // the owner sends their application in; what they sent is frozen as the submission
    submitApplication: (vendorId) => {
      const v = vendors.find((x) => x.id === vendorId)
      if (!v || user?.vendorId !== vendorId || !vendorCanEdit(v)) return
      const { name, categorySlug, location, tagline, description, services, bestFor, vibes, guestRange, instagram, website, images, tags } = v
      dispatch({
        type: 'overrideVendor',
        vendorId,
        patch: {
          listing: 'pending',
          submittedAt: new Date().toISOString(),
          review: undefined,
          submission: { name, categorySlug, location, tagline, description, services, bestFor, vibes, guestRange, instagram, website, images, tags },
        },
      })
    },
    // only host it moves a listing past review; a vendor can never approve or publish their own
    reviewApplication: (vendorId, action, note) => {
      if (!isAdmin) return
      const v = vendors.find((x) => x.id === vendorId)
      if (!v) return
      const now = new Date().toISOString()
      const text = note?.trim() || undefined
      const next: Record<ReviewAction, ListingStatus> = {
        approve: 'approved',
        'request-info': 'needs-info',
        decline: 'rejected',
        publish: 'live',
        unpublish: 'approved',
      }
      dispatch({
        type: 'overrideVendor',
        vendorId,
        patch: { listing: next[action], review: { decidedAt: now, note: text }, ...(action === 'publish' ? { publishedAt: now } : {}) },
      })
      const owner = ownerOf(vendorId)
      if (!owner) return
      const messages: Record<ReviewAction, [string, string]> = {
        approve: [`${v.name} is approved`, text ?? "welcome to the host it network. we're preparing your public profile and will let you know when it's live."],
        'request-info': ['host it needs a little more information', text ?? 'please update your application and submit it again.'],
        decline: ['an update on your host it application', text ?? "we're not able to add you to the network right now."],
        publish: [`${v.name} is live`, 'your profile is now public in the host it network.'],
        unpublish: [`${v.name} is no longer public`, text ?? 'your profile has been taken offline while host it updates it.'],
      }
      notify(owner.id, ...messages[action], '/vendor')
    },
    changeRequests: isAdmin ? state.changeRequests : state.changeRequests.filter((r) => r.userId === user?.id),
    requestChange: (vendorId, message) => {
      const v = vendors.find((x) => x.id === vendorId)
      if (!user || !v || user.vendorId !== vendorId) return 'only the business owner can request changes.'
      if (listingOf(v) !== 'live') return 'change requests open once your profile is live.'
      if (message.trim().length < 10) return 'tell us a little more about what should change.'
      dispatch({
        type: 'requestChange',
        request: { id: uid('cr'), vendorId, userId: user.id, message: message.trim(), createdAt: new Date().toISOString(), status: 'open' },
      })
      return null
    },
    resolveChangeRequest: (id, reply) => {
      if (!isAdmin) return
      const r = state.changeRequests.find((x) => x.id === id)
      if (!r || r.status === 'resolved') return
      dispatch({ type: 'resolveChange', id, reply: reply?.trim() || undefined })
      notify(r.userId, 'your change request was handled', reply?.trim() || 'host it has reviewed your requested changes.', '/vendor')
    },
    // Rate-limited, single-use, expiring links. There's no mail server in the POC, so the link comes back
    // for the demo inbox. The limit is counted per email whether or not an account exists, and an unknown
    // email gets the same answers with no link, so neither the reply nor the limit reveals who has an account.
    requestPasswordReset: (email) => {
      const key = email.trim().toLowerCase()
      if (!isEmail(key)) return { error: "that email doesn't look right." }
      const now = Date.now()
      const recent = state.resetRequests.filter((r) => r.email === key && now - Date.parse(r.at) < RESET_WINDOW_MS)
      if (recent.length >= RESET_MAX_PER_WINDOW) return { error: 'too many reset requests. try again in 15 minutes.' }
      if (recent.some((r) => now - Date.parse(r.at) < RESET_COOLDOWN_MS)) return { error: 'a link was just sent. wait a minute before asking for another.' }
      dispatch({ type: 'logResetRequest', email: key })
      const target = state.accounts.find((u) => u.email.toLowerCase() === key)
      if (!target) return {}
      const token: ResetToken = { token: newToken(), userId: target.id, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + RESET_TTL_MS).toISOString() }
      dispatch({ type: 'issueResetToken', token })
      return { link: `/reset-password?token=${token.token}` }
    },
    checkResetToken: (token) => {
      const t = state.resetTokens.find((r) => r.token === token)
      if (!t) return 'invalid'
      if (t.usedAt) return 'used'
      return Date.now() > Date.parse(t.expiresAt) ? 'expired' : 'valid'
    },
    resetPassword: (token, password) => {
      const t = state.resetTokens.find((r) => r.token === token)
      if (!t || t.usedAt || Date.now() > Date.parse(t.expiresAt)) return 'this link is no longer valid. request a new one.'
      if (password.length < 8) return 'use at least 8 characters for your password.'
      dispatch({ type: 'useResetToken', token, password })
      notify(t.userId, 'your password was changed', "if this wasn't you, contact host it right away.", '/account')
      return null
    },
    createEvent: (input) => {
      const event: EventBoard = {
        id: uid('e'),
        ownerId: user?.id ?? 'anon',
        name: input.name,
        type: input.type,
        guests: input.guests,
        date: input.date,
        time: input.time ?? '',
        location: input.location ?? '',
        vibes: input.vibes ?? [],
        needs: input.needs ?? [],
        vendorIds: [],
        customVendors: [],
        tasks: [],
        stickies: [],
        cover: COVERS[state.events.length % COVERS.length],
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'createEvent', event })
      return event
    },
    updateEvent: (id, patch) => dispatch({ type: 'updateEvent', id, patch }),
    deleteEvent: (id) => dispatch({ type: 'deleteEvent', id }),
    addVendorsToEvent: (eventId, vendorIds, message, contact = true) =>
      dispatch({ type: 'addVendors', eventId, vendorIds, customerId: user?.id ?? 'anon', message, contact }),
    contactVendor: (eventId, vendorId) =>
      dispatch({ type: 'contactVendor', eventId, vendorId, customerId: user?.id ?? 'anon' }),
    removeVendorFromEvent: (eventId, vendorId) => dispatch({ type: 'removeVendor', eventId, vendorId }),
    setInquiryStatus: (id, status) => dispatch({ type: 'setInquiryStatus', id, status }),
    // host it edits any listing; a vendor only their own application, and only while it's editable
    overrideVendor: (vendorId, patch) => {
      const v = vendors.find((x) => x.id === vendorId)
      if (isAdmin || (v && user?.vendorId === vendorId && vendorCanEdit(v))) dispatch({ type: 'overrideVendor', vendorId, patch })
    },
    vendorById: (id) => vendors.find((v) => v.id === id),
    vendorBySlug: (slug) => vendors.find((v) => v.slug === slug),
    inquiryFor: (eventId, vendorId) =>
      state.inquiries.find((i) => i.eventId === eventId && i.vendorId === vendorId),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
