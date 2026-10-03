// Shape check only: something@something.tld. Good enough for a mock that never sends mail.
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isEmail = (s: string) => EMAIL.test(s.trim())
