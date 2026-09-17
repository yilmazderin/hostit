import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type {
  CategorySlug,
  EventBoard,
  EventType,
  Inquiry,
  InquiryStatus,
  User,
  Vendor,
  VendorOverride,
  VibeTag,
} from '../types'
import { USERS } from '../data/users'
import { VENDORS } from '../data/vendors'
import { SEED_EVENTS, SEED_INQUIRIES } from '../data/seed'
import { clear, load, save, uid } from './storage'

interface State {
  sessionUserId: string | null
  events: EventBoard[]
  inquiries: Inquiry[]
  vendorOverrides: Record<string, VendorOverride>
}

const initial = (): State => ({
  sessionUserId: null,
  events: SEED_EVENTS,
  inquiries: SEED_INQUIRIES,
  vendorOverrides: {},
})

type Action =
  | { type: 'login'; userId: string }
  | { type: 'logout' }
  | { type: 'reset' }
  | { type: 'createEvent'; event: EventBoard }
  | { type: 'updateEvent'; id: string; patch: Partial<EventBoard> }
  | { type: 'deleteEvent'; id: string }
  | { type: 'addVendors'; eventId: string; vendorIds: string[]; customerId: string; message?: string }
  | { type: 'removeVendor'; eventId: string; vendorId: string }
  | { type: 'setInquiryStatus'; id: string; status: InquiryStatus }
  | { type: 'overrideVendor'; vendorId: string; patch: VendorOverride }

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
      const inquiries = fresh.map<Inquiry>((vendorId) => ({
        id: uid('i'),
        eventId: event.id,
        vendorId,
        customerId: action.customerId,
        message:
          action.message ??
          `hi! planning ${event.name} (${event.type}, ${event.guests} guests) on ${event.date}. would love to work with you.`,
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
    default:
      return state
  }
}

export interface NewEventInput {
  name: string
  type: EventType
  guests: number
  date: string
  vibes?: VibeTag[]
  needs?: CategorySlug[]
  notes?: string
}

const COVERS = ['moss', 'blush', 'sky', 'plum', 'honey', 'clay', 'slate', 'sand']

interface Ctx {
  user: User | null
  users: User[]
  vendors: Vendor[]
  events: EventBoard[]
  myEvents: EventBoard[]
  inquiries: Inquiry[]
  login: (email: string, password: string) => User | null
  logout: () => void
  resetDemo: () => void
  createEvent: (input: NewEventInput) => EventBoard
  updateEvent: (id: string, patch: Partial<EventBoard>) => void
  deleteEvent: (id: string) => void
  addVendorsToEvent: (eventId: string, vendorIds: string[], message?: string) => void
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
    () => VENDORS.map((v) => ({ ...v, ...(state.vendorOverrides[v.id] ?? {}) })),
    [state.vendorOverrides],
  )

  const user = useMemo(
    () => USERS.find((u) => u.id === state.sessionUserId) ?? null,
    [state.sessionUserId],
  )

  const myEvents = useMemo(
    () => (user ? state.events.filter((e) => e.ownerId === user.id) : []),
    [state.events, user],
  )

  const value: Ctx = {
    user,
    users: USERS,
    vendors,
    events: state.events,
    myEvents,
    inquiries: state.inquiries,
    login: (email, password) => {
      const found = USERS.find(
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
    createEvent: (input) => {
      const event: EventBoard = {
        id: uid('e'),
        ownerId: user?.id ?? 'anon',
        name: input.name,
        type: input.type,
        guests: input.guests,
        date: input.date,
        vibes: input.vibes ?? [],
        needs: input.needs ?? [],
        vendorIds: [],
        notes: input.notes ?? '',
        cover: COVERS[state.events.length % COVERS.length],
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'createEvent', event })
      return event
    },
    updateEvent: (id, patch) => dispatch({ type: 'updateEvent', id, patch }),
    deleteEvent: (id) => dispatch({ type: 'deleteEvent', id }),
    addVendorsToEvent: (eventId, vendorIds, message) =>
      dispatch({ type: 'addVendors', eventId, vendorIds, customerId: user?.id ?? 'anon', message }),
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
