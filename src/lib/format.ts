export function formatDate(iso: string) {
  if (!iso) return 'date tbd'
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase()
}

export function plural(n: number, word: string) {
  if (n === 1) return `${n} ${word}`
  return `${n} ${word}${/(s|x|z|ch|sh)$/.test(word) ? 'es' : 's'}`
}

export function toISODate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
