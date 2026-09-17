# host it — proof of concept

A clickable React proof of concept for [Host It](https://www.hostitevents.com/): customers explore a curated vendor network or answer a short planning survey, then pin vendors to Pinterest-style event boards. Vendors manage their profile, availability, and incoming inquiries. All data is mock and lives in `localStorage`.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

## Demo logins

Password for every account is `hostit`.

| role | email | what you'll see |
|---|---|---|
| customer | `customer@hostit.com` | Maya, with two seeded event boards |
| vendor | `vendor@hostit.com` | A Couple Cocktails, with pending inquiries |
| vendor | `pantry@hostit.com` | The Pantry, a second vendor view |

The login page also has one-click chips for each account. Use **reset** in the nav to restore the seeded data.

## Demo script

**Customer**
1. Sign in as the customer. Home offers two pathways: explore the network, or plan an event.
2. Explore → pick a category → open a vendor → "add to event" pins them to a board and sends the vendor an inquiry.
3. Plan → answer five questions (type, guests, date, vibe, needs) → a curated shortlist grouped by need, with reasons for each match. Select vendors, preview profiles in place, confirm into a new or existing board.
4. My events → boards gallery. Open a board to see pins, inquiry status, a needs checklist, and notes.

**Vendor**
1. Sign in as a vendor. The dashboard lists inquiries from planners with the event details. Accept or decline; the customer's board badge updates.
2. My profile → edit tagline, services, best-for and vibe tags, gallery. Changes show on the customer side immediately.
3. Availability → block dates. Blocked vendors drop out of survey results for that date.

## Stack

Vite, React 18, TypeScript, React Router 7, Tailwind 4. State is a single reducer in `src/store/AppContext.tsx`; matching lives in `src/lib/matchVendors.ts`; mock data is under `src/data/`.
