import type { CategorySlug, MatchResult, Survey, Vendor } from '../types'

export function matchVendors(survey: Survey, vendors: Vendor[]): MatchResult[] {
  return vendors
    .filter((v) => survey.needs.includes(v.categorySlug))
    .filter((v) => !survey.date || !v.unavailableDates.includes(survey.date))
    .map((vendor) => {
      let score = 0
      const reasons: string[] = []
      if (survey.type && vendor.bestFor.includes(survey.type)) {
        score += 3
        reasons.push(`great for ${survey.type}s`)
      }
      const vibeHits = vendor.vibes.filter((t) => survey.vibes.includes(t))
      if (vibeHits.length) {
        score += vibeHits.length * 2
        reasons.push(`matches ${vibeHits.join(', ')}`)
      }
      if (survey.guests >= vendor.guestRange.min && survey.guests <= vendor.guestRange.max) {
        score += 1
        reasons.push(`fits ${survey.guests} guests`)
      }
      if (vendor.featured) {
        score += 1
        reasons.push('host it pick')
      }
      return { vendor, score, reasons }
    })
    .sort((a, b) => b.score - a.score || a.vendor.name.localeCompare(b.vendor.name))
}

export function groupByCategory(results: MatchResult[], order: CategorySlug[]) {
  return order
    .map((slug) => ({ slug, results: results.filter((r) => r.vendor.categorySlug === slug) }))
    .filter((g) => g.results.length > 0)
}
