// a preview build published beside the main site sets its own key, so the two never share demo data
const KEY = import.meta.env.VITE_STORAGE_KEY || 'hostit-poc-v3'

export function load<T>(): T | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function save<T>(state: T) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
