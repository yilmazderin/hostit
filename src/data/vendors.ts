import type { CategorySlug, EventType, Vendor, VibeTag } from '../types'

const img = (slug: string, n = 6) =>
  Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${slug}-${i + 1}/800/600`)

interface Seed {
  slug: string
  name: string
  cat: CategorySlug
  tagline: string
  description: string
  services: string[]
  bestFor: EventType[]
  vibes: VibeTag[]
  guests: [number, number]
  instagram?: string
  website?: string
  featured?: boolean
  unavailable?: string[]
}

const seeds: Seed[] = [
  // food & drink
  {
    slug: 'the-pantry', name: 'The Pantry', cat: 'food-drink',
    tagline: 'for the moments worth celebrating',
    description: 'handcrafted, small-batch desserts made for the occasions that matter. wedding cakes, custom sugar cookies, and dessert tables built around refined details and quality ingredients, sourced locally whenever we can.',
    services: ['wedding cakes', 'dessert tables', 'custom sugar cookies', 'branded cookies'],
    bestFor: ['wedding', 'shower', 'birthday', 'brand event'],
    vibes: ['elevated', 'minimal', 'garden', 'intimate'],
    guests: [10, 250], instagram: '@thepantrybakeshop', featured: true,
  },
  {
    slug: 'a-couple-cocktails', name: 'A Couple Cocktails', cat: 'food-drink',
    tagline: 'where creativity meets the bar.',
    description: 'mobile bar experiences designed around your event. custom cocktail menus, artistic garnishes, and styled bar details backed by nearly two decades behind the bar. infused syrups, dehydrated fruit, and edible flowers come standard.',
    services: ['mobile bar', 'custom cocktail menus', 'bartending staff', 'mocktail programs'],
    bestFor: ['wedding', 'shower', 'private gathering', 'brand event', 'corporate'],
    vibes: ['elevated', 'glam', 'moody', 'festive', 'modern'],
    guests: [20, 300], instagram: '@acouplecocktailswindsor', website: 'acouplecocktails.ca', featured: true,
    unavailable: ['2026-10-10', '2026-10-17'],
  },
  {
    slug: 'sugar-daddy-puddin', name: "Sugar Daddy Puddin'", cat: 'food-drink',
    tagline: 'banana pudding, but make it a moment.',
    description: 'layered pudding cups and pudding bars that guests line up for. playful flavours, nostalgic presentation, and a setup that doubles as decor.',
    services: ['pudding bar', 'individual cups', 'late-night dessert'],
    bestFor: ['birthday', 'private gathering', 'brand event', 'shower'],
    vibes: ['playful', 'retro', 'festive', 'cozy'],
    guests: [15, 200], instagram: '@sugardaddypuddin',
  },
  {
    slug: 'dree-eats', name: 'Dree Eats', cat: 'food-drink',
    tagline: 'grazing tables with intention.',
    description: 'seasonal grazing tables, boxes, and charcuterie styled to the room. built for slow evenings and long conversations.',
    services: ['grazing tables', 'charcuterie boxes', 'brunch boards'],
    bestFor: ['shower', 'private gathering', 'corporate', 'wedding'],
    vibes: ['boho', 'garden', 'rustic', 'intimate', 'cozy'],
    guests: [8, 150], instagram: '@dree.eats',
  },
  {
    slug: 'mocktail-muse', name: 'Mocktail Muse', cat: 'food-drink',
    tagline: 'zero proof, full experience.',
    description: 'alcohol-free bar service with house-made syrups and botanicals. designed for daytime showers, wellness gatherings, and inclusive celebrations.',
    services: ['mocktail bar', 'welcome drinks', 'botanical spritzes'],
    bestFor: ['shower', 'corporate', 'workshop', 'birthday'],
    vibes: ['garden', 'minimal', 'coastal', 'elevated'],
    guests: [10, 120], instagram: '@mocktailmuse',
  },
  {
    slug: 'soluna-sip', name: 'Soluna Sip', cat: 'food-drink',
    tagline: 'espresso, matcha, and a little golden hour.',
    description: 'a mobile coffee and matcha cart for mornings that deserve better. latte art, iced everything, and a cart that photographs beautifully.',
    services: ['coffee cart', 'matcha bar', 'brunch service'],
    bestFor: ['brand event', 'corporate', 'shower', 'workshop'],
    vibes: ['modern', 'minimal', 'coastal', 'playful'],
    guests: [15, 200], instagram: '@solunasip',
  },
  // styling & decor
  {
    slug: 'lindsays-florals', name: "Lindsay's Florals", cat: 'styling-decor',
    tagline: 'garden-grown, hand-arranged.',
    description: 'loose, seasonal florals with a wild edge. bouquets, installations, and tablescapes that look like they were picked that morning, because they were.',
    services: ['bouquets', 'centrepieces', 'floral installations', 'bud vase rentals'],
    bestFor: ['wedding', 'shower', 'private gathering'],
    vibes: ['garden', 'boho', 'rustic', 'intimate'],
    guests: [10, 300], instagram: '@lindsaysflorals', featured: true,
  },
  {
    slug: 'the-lit-marquee', name: 'The Lit Marquee', cat: 'styling-decor',
    tagline: 'say it in lights.',
    description: 'oversized marquee letters and numbers, custom neon, and statement lighting rentals. delivery, setup, and takedown included.',
    services: ['marquee letters', 'custom neon', 'string light installs'],
    bestFor: ['birthday', 'wedding', 'brand event', 'corporate'],
    vibes: ['glam', 'festive', 'retro', 'modern', 'moody'],
    guests: [20, 500], instagram: '@thelitmarquee',
  },
  {
    slug: 'the-adorned-garden', name: 'The Adorned Garden', cat: 'styling-decor',
    tagline: 'dried florals and soft textures.',
    description: 'dried and preserved floral styling, arches, and backdrops in warm neutral palettes. low-maintenance, long-lasting, and endlessly photographable.',
    services: ['dried arrangements', 'ceremony arches', 'backdrops', 'styling consults'],
    bestFor: ['wedding', 'shower', 'brand event'],
    vibes: ['boho', 'minimal', 'rustic', 'cozy'],
    guests: [10, 200], instagram: '@theadornedgarden',
  },
  {
    slug: 'peris-touch', name: 'Peris Touch', cat: 'styling-decor',
    tagline: 'balloons, elevated.',
    description: 'organic balloon garlands, installations, and sculptural pieces in curated colour stories. no primary colours unless you ask nicely.',
    services: ['balloon garlands', 'installations', 'welcome signs'],
    bestFor: ['birthday', 'shower', 'brand event', 'corporate'],
    vibes: ['playful', 'festive', 'glam', 'modern'],
    guests: [10, 400], instagram: '@peris.touch',
  },
  {
    slug: 'where-love-abounds', name: 'Where Love Abounds', cat: 'styling-decor',
    tagline: 'full-service event styling.',
    description: 'concept-to-teardown styling and day-of coordination. tablescapes, rentals, signage, and the timeline that holds it all together.',
    services: ['event styling', 'tablescapes', 'day-of coordination', 'rentals'],
    bestFor: ['wedding', 'corporate', 'brand event', 'private gathering'],
    vibes: ['elevated', 'glam', 'modern', 'minimal', 'moody'],
    guests: [30, 400], instagram: '@whereloveabounds', featured: true,
  },
  // photo & moments
  {
    slug: 'inna-kovaleva', name: 'Inna Kovaleva', cat: 'photo-moments',
    tagline: 'documentary, editorial, unhurried.',
    description: 'natural light photography that feels like a film still. weddings, intimate gatherings, and editorial brand work across windsor-essex.',
    services: ['wedding photography', 'event coverage', 'editorial sessions'],
    bestFor: ['wedding', 'private gathering', 'brand event', 'shower'],
    vibes: ['moody', 'elevated', 'intimate', 'minimal'],
    guests: [2, 300], instagram: '@innakovaleva.photo', featured: true,
    unavailable: ['2026-10-10'],
  },
  {
    slug: 'your-event-canvas-co', name: 'Your Event Canvas & Co.', cat: 'photo-moments',
    tagline: 'live painting, right in the room.',
    description: 'a live event painter captures your celebration on canvas while it happens. guests watch it come together; you take home the piece.',
    services: ['live event painting', 'guest portraits', 'custom commissions'],
    bestFor: ['wedding', 'corporate', 'birthday'],
    vibes: ['elevated', 'garden', 'glam', 'intimate'],
    guests: [20, 300], instagram: '@youreventcanvas',
  },
  {
    slug: 'lamassu-events', name: 'Lamassu Events', cat: 'photo-moments',
    tagline: 'content that moves.',
    description: 'short-form video and same-day content for launches, parties, and weddings. reels delivered before the night ends.',
    services: ['content creation', 'same-day reels', 'photo + video packages'],
    bestFor: ['brand event', 'corporate', 'birthday', 'wedding'],
    vibes: ['modern', 'festive', 'glam', 'playful'],
    guests: [20, 500], instagram: '@lamassuevents',
  },
  {
    slug: 'still-frame-booth', name: 'Still Frame Booth', cat: 'photo-moments',
    tagline: 'the photo booth that looks like a magazine.',
    description: 'glam-style black and white booth with studio lighting, instant prints, and a digital gallery. minimal footprint, maximum lineup.',
    services: ['glam booth', 'instant prints', 'digital gallery'],
    bestFor: ['wedding', 'birthday', 'corporate', 'brand event'],
    vibes: ['glam', 'retro', 'modern', 'festive'],
    guests: [40, 500], instagram: '@stillframebooth',
  },
  // entertainment
  {
    slug: 'dj-soleil', name: 'DJ Soleil', cat: 'entertainment',
    tagline: 'open-format sets that read the room.',
    description: 'weddings, launches, and late nights. curated playlists built with you, seamless mc-ing, and a sound setup that fits the space.',
    services: ['dj sets', 'mc services', 'sound + lighting'],
    bestFor: ['wedding', 'birthday', 'brand event', 'corporate'],
    vibes: ['festive', 'glam', 'modern', 'playful'],
    guests: [40, 500], instagram: '@djsoleil', featured: true,
  },
  {
    slug: 'the-riverside-trio', name: 'The Riverside Trio', cat: 'entertainment',
    tagline: 'strings for ceremonies and slow evenings.',
    description: 'a violin, cello, and guitar trio playing everything from classical to reimagined pop. ideal for ceremonies, cocktail hours, and dinners.',
    services: ['ceremony music', 'cocktail hour sets', 'dinner sets'],
    bestFor: ['wedding', 'private gathering', 'corporate'],
    vibes: ['elevated', 'intimate', 'garden', 'minimal'],
    guests: [10, 250], instagram: '@theriversidetrio',
  },
  {
    slug: 'vinyl-hour', name: 'Vinyl Hour', cat: 'entertainment',
    tagline: 'all-vinyl sets, warm and unhurried.',
    description: 'a vinyl-only dj spinning soul, disco, and lo-fi for patios, dinner parties, and shop openings. brings the records and the mood.',
    services: ['vinyl dj sets', 'listening lounge setup'],
    bestFor: ['private gathering', 'brand event', 'birthday'],
    vibes: ['retro', 'cozy', 'moody', 'coastal'],
    guests: [10, 150], instagram: '@vinylhourwindsor',
  },
  {
    slug: 'the-gilded-mic', name: 'The Gilded Mic', cat: 'entertainment',
    tagline: 'jazz vocals, live and low-lit.',
    description: 'a vocalist and pianist duo for cocktail hours and intimate dinners. standards, bossa nova, and requests taken with a smile.',
    services: ['live jazz duo', 'solo vocalist', 'piano bar'],
    bestFor: ['corporate', 'wedding', 'private gathering'],
    vibes: ['moody', 'elevated', 'glam', 'intimate'],
    guests: [10, 200], instagram: '@thegildedmic',
  },
  // workshops & experiences
  {
    slug: 'sip-n-swirl', name: "Sip N' Swirl", cat: 'workshops-experiences',
    tagline: 'paint, sip, repeat.',
    description: 'hosted paint nights and candle-pouring sessions for groups. all supplies included, plus a host who keeps it light.',
    services: ['paint nights', 'candle pouring', 'private group sessions'],
    bestFor: ['workshop', 'birthday', 'corporate', 'shower'],
    vibes: ['playful', 'cozy', 'festive', 'boho'],
    guests: [6, 40], instagram: '@sipnswirl',
  },
  {
    slug: 'aloha-jewels', name: 'Aloha Jewels', cat: 'workshops-experiences',
    tagline: 'permanent jewelry, on the spot.',
    description: 'a pop-up permanent jewelry bar: pick a chain, get it welded, keep it forever. a favourite for showers and brand activations.',
    services: ['permanent jewelry bar', 'bracelet + anklet welding'],
    bestFor: ['shower', 'brand event', 'birthday', 'workshop'],
    vibes: ['coastal', 'playful', 'glam', 'modern'],
    guests: [8, 120], instagram: '@alohajewels', featured: true,
  },
  {
    slug: 'rings-n-things', name: "Rings N' Things", cat: 'workshops-experiences',
    tagline: 'make the ring you keep.',
    description: 'hands-on silver ring-making workshops for small groups. hammer, texture, and polish your own piece in about two hours.',
    services: ['ring-making workshops', 'private studio sessions'],
    bestFor: ['workshop', 'shower', 'birthday', 'corporate'],
    vibes: ['rustic', 'intimate', 'minimal', 'boho'],
    guests: [4, 16], instagram: '@ringsnthings.studio',
  },
  {
    slug: 'clay-and-company', name: 'Clay & Company', cat: 'workshops-experiences',
    tagline: 'hand-building for beginners.',
    description: 'pottery workshops with no wheel required. pinch pots, trinket dishes, and mugs, fired and returned within two weeks.',
    services: ['hand-building workshops', 'corporate team sessions'],
    bestFor: ['workshop', 'corporate', 'birthday'],
    vibes: ['rustic', 'minimal', 'cozy', 'boho'],
    guests: [6, 30], instagram: '@clayandcompany',
  },
  // wellness
  {
    slug: 'radiance-yoga', name: 'Radiance Yoga', cat: 'wellness',
    tagline: 'slow flows for good mornings.',
    description: 'private and group yoga sessions for retreats, showers, and team days. mats provided, playlists curated, sunrise optional.',
    services: ['private yoga', 'group flows', 'retreat programming'],
    bestFor: ['shower', 'corporate', 'workshop', 'private gathering'],
    vibes: ['garden', 'minimal', 'coastal', 'intimate'],
    guests: [4, 40], instagram: '@radianceyoga',
  },
  {
    slug: 'flow-fire', name: 'flow + fire', cat: 'wellness',
    tagline: 'breathwork and sauna, together.',
    description: 'guided breathwork sessions paired with a mobile sauna. a reset for wellness retreats, bachelorette weekends, and team offsites.',
    services: ['breathwork', 'mobile sauna', 'cold plunge'],
    bestFor: ['private gathering', 'corporate', 'workshop'],
    vibes: ['rustic', 'moody', 'coastal', 'minimal'],
    guests: [4, 24], instagram: '@flowandfire',
  },
  {
    slug: 'forma', name: 'Forma', cat: 'wellness',
    tagline: 'pilates, anywhere.',
    description: 'mat pilates and mobility sessions brought to your venue. clean, modern, and easy to fit into a morning agenda.',
    services: ['mat pilates', 'mobility sessions', 'wellness breaks'],
    bestFor: ['corporate', 'shower', 'workshop'],
    vibes: ['modern', 'minimal', 'elevated'],
    guests: [4, 30], instagram: '@forma.movement',
  },
  // venues
  {
    slug: 'the-loft-on-ouellette', name: 'The Loft on Ouellette', cat: 'venues-spaces',
    tagline: 'brick, light, and room to move.',
    description: 'a downtown loft with exposed brick, 16-foot ceilings, and a wall of windows. blank enough to style, warm enough to leave alone.',
    services: ['full venue rental', 'tables + chairs', 'in-house sound'],
    bestFor: ['wedding', 'brand event', 'corporate', 'birthday'],
    vibes: ['modern', 'minimal', 'moody', 'elevated'],
    guests: [40, 180], instagram: '@theloftonouellette', featured: true,
  },
  {
    slug: 'harrow-greenhouse', name: 'Harrow Greenhouse', cat: 'venues-spaces',
    tagline: 'a working greenhouse, after hours.',
    description: 'glass, greenery, and long harvest tables in the county. golden hour hits at 7:40 and we plan around it.',
    services: ['greenhouse rental', 'harvest tables', 'string lighting'],
    bestFor: ['wedding', 'shower', 'private gathering'],
    vibes: ['garden', 'boho', 'rustic', 'intimate', 'cozy'],
    guests: [20, 120], instagram: '@harrowgreenhouse',
  },
  {
    slug: 'the-back-patio', name: 'The Back Patio', cat: 'venues-spaces',
    tagline: 'a walled garden patio in walkerville.',
    description: 'an intimate outdoor patio behind a walkerville storefront. ivy, café lights, and a fire table for small dinners and launches.',
    services: ['patio rental', 'fire table', 'heaters'],
    bestFor: ['private gathering', 'birthday', 'brand event'],
    vibes: ['cozy', 'garden', 'intimate', 'retro'],
    guests: [10, 45], instagram: '@thebackpatioyqg',
  },
]

export const VENDORS: Vendor[] = seeds.map((s) => ({
  id: `v-${s.slug}`,
  slug: s.slug,
  name: s.name,
  categorySlug: s.cat,
  tagline: s.tagline,
  location: 'Windsor, ON',
  description: s.description,
  services: s.services,
  bestFor: s.bestFor,
  vibes: s.vibes,
  guestRange: { min: s.guests[0], max: s.guests[1] },
  unavailableDates: s.unavailable ?? [],
  instagram: s.instagram,
  website: s.website,
  images: img(s.slug),
  featured: s.featured,
}))
