import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type {
  CategorySlug,
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
}

const initial = (): State => ({
  sessionUserId: null,
  accounts: USERS,
  events: SEED_EVENTS,
  inquiries: SEED_INQUIRIES,
  vendorOverrides: {},
  applicants: SEED_APPLICANTS,
  favourites: { 'u-maya': ['v-the-pantry', 'v-lindsays-florals', 'v-dj-soleil'] },
  notifications: [],
})

// seeded vendors carry no listing field; they're the approved network
export const isListed = (v: Vendor) => (v.listing ?? 'approved') === 'approved'

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
  submitApplication: (vendorId: string) => void
  reviewApplication: (vendorId: string, decision: 'approved' | 'rejected', note?: string) => void
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
  const [state, dispatch] = useReducer(reducer, undefined, () => load<State>() ?? initial())

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
      let vendor: Vendor | undefined
      if (input.business) {
        const base = slugify(input.business.name) || 'vendor'
        const slug = vendors.some((v) => v.slug === base) ? `${base}-${uid('x').slice(-4)}` : base
        vendor = {
          id: `v-${slug}`,
          slug,
          name: input.business.name.trim(),
          categorySlug: input.business.categorySlug,
          location: input.business.location.trim() || 'Windsor, ON',
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
    submitApplication: (vendorId) =>
      dispatch({ type: 'overrideVendor', vendorId, patch: { listing: 'pending', submittedAt: new Date().toISOString(), review: undefined } }),
    reviewApplication: (vendorId, decision, note) => {
      const now = new Date().toISOString()
      dispatch({ type: 'overrideVendor', vendorId, patch: { listing: decision, review: { decidedAt: now, note: note?.trim() || undefined } } })
      const owner = state.accounts.find((u) => u.vendorId === vendorId)
      const name = vendors.find((v) => v.id === vendorId)?.name ?? 'your business'
      if (owner)
        dispatch({
          type: 'notify',
          notification: {
            id: uid('n'),
            userId: owner.id,
            createdAt: now,
            read: false,
            to: '/vendor',
            title: decision === 'approved' ? `${name} is now part of the host it network` : 'an update on your host it application',
            body:
              decision === 'approved'
                ? 'your profile is live. planners can find you, pin you to boards and send inquiries.'
                : note?.trim() || "we're not able to add you to the network right now. you can update your profile and resubmit.",
          },
        })
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
    overrideVendor: (vendorId, patch) => dispatch({ type: 'overrideVendor', vendorId, patch }),
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
