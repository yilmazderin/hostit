# host it — proof of concept

A clickable React proof of concept for [Host It](https://www.hostitevents.com/), a curated network of event vendors and experiences in Windsor-Essex.

- **Visitors** can browse the network, view vendor profiles and try the planning survey without an account.
- **Planners** sign up to save vendors, build event boards, track every vendor's status and keep tasks and notes for each event.
- **Vendors** apply to join the network. The Host It team reviews each application before the vendor becomes public.

All data is mock and lives in the browser's `localStorage`, so every visitor gets their own private copy of the demo.

**Live demo:** https://yilmazderin.github.io/hostit/

---

## What's new in this version

Compared with the initial version, which is preserved on the [`initial-draft`](https://github.com/yilmazderin/hostit/tree/initial-draft) branch.

### Public site and navigation
- **Public home page:** photo hero, large category imagery, how it works, who it's for, a section for vendors and a closing call to action. It's separate from the signed-in dashboard.
- **New pages:** About, Services, Contact, Terms of Use and Privacy Policy.
- **Browsing is open to everyone.** The network, category pages and vendor profiles no longer require an account.
- **Navigation:**
  - Signed out: home · about · network · services, with a quiet *log in* and an outlined *sign up*, so signing up isn't the first thing asked.
  - Signed in: the account's own pages, plus an account menu (dashboard, account settings, log out).
- **Footer** links to every public page. *Reset demo data* moved here from the nav.

### Accounts
- **Create an account** (`/signup`) offers two paths.
  - **Planner (user account):** name, email and password, then *"What best describes you?"* (planning for myself / for a business / professionally). The answer is stored on the account; all three get the same experience in V1.
  - **Vendor:** *Join the Network* (`/join`), described below.
- **Terms acknowledgement** at sign-up for the Terms of Use and Privacy Policy. Vendors also confirm that applying doesn't guarantee acceptance.
- **Account settings** (`/account`): name, email, password, account type, the date the terms were accepted, and log out.
- **Sign-ins persist:** new accounts live in the demo data, so they can sign out and back in.

### Dashboard (planners)
- After signing in, planners land on the **Dashboard**, not "Home".
- **Profile area:** the name and avatar at the top open account settings.
- **Main options:**
  - browse vendors
  - plan an event
  - your events, with **+ add event**
  - favourite vendors
  - *need more help? contact Host It*
- **+ add event opens in place.** Cancelling it, or exiting the planning survey, returns you to the Dashboard instead of jumping to Your Events.

### Network, categories and vendor profiles
- **Network page:** larger, more editorial category imagery with the text below the image (not over it). The vendor counts and the *Host It Picks* section are removed for V1.
- **Category pages:**
  - the vendor count, e.g. *6 vendors*
  - tag filters for each category, e.g. mocktails, mobile bar, catering
- **Vendor profiles:**
  - an editorial layout
  - highlighted tags, e.g. *corporate events · mobile bar · windsor-essex*
  - Instagram and website icons that sit below the main call to action
  - a call-to-action card that stays on screen as you scroll
- **Favourites:** a heart on profiles and vendor cards saves the vendor to *Favourite Vendors* on the Dashboard. Signed-out visitors are sent to sign up first.

### Vendor application and approval
A vendor account and a public listing are now separate things. Host It decides who joins the curated network.

**The flow:** Join the Network → create a vendor account → complete the profile → submit for review → Host It reviews → approved vendors become publicly discoverable.

- **What vendors submit:**
  - at sign-up: business name, category and location
  - in the profile: tagline, description, services, best-for event types, tags, guest range, at least 3 photos, and optionally Instagram/website
- **Vendor dashboard while not approved**, in one of three states:
  - *in progress*: a checklist and "submit for review"
  - *under review*: a timeline
  - *not approved*: Host It's note and "resubmit"
- **Preview:** vendors can view their full profile behind a *"not public yet"* banner. Only they and the Host It team can open it.
- **Editing:** allowed while under review, and changes go straight into the application. After approval, business name, category and location lock (contact Host It to change them).
- **Admin review queue** (`/admin`), with tabs for awaiting review, in progress, approved and not approved. Each application shows:
  - a completeness checklist
  - a full profile preview
  - a note field
  - *approve & publish* or *decline*; approved vendors can later be removed from the network
- **Notifications:** an in-app notice on the vendor's dashboard and a dot on their avatar.
- **Locked until approval:** the public listing, planning matches, favourites, inquiries and the availability calendar.

### Event board
The board now reads top to bottom: **event info → what you need → vendors → planning tools.**

- **Event info:** a compact header with type tag · date · time · location · guests. Event time and location are new fields.
  - Missing details show as *add time* / *add location* links.
  - **Edit details** uses consistent field sizes.
- **What you need:** a progress tracker for each category, e.g. *food & drink 2 / 2*.
  - You set how many of each you need, and confirmed vendors fill them.
  - Tapping a category filters the vendors.
- **Vendor cards:** one uniform size and structure. Images crop to a fixed area.
- **Vendor status:**
  - The four statuses: *confirmed*, *contacted / pending*, *not contacted* and *declined / unavailable*.
  - You can filter by status or category and group by either.
  - Confirmed vendors come first, and the summary shows confirmed versus considering.
- **Pinning without contacting:** vendors can be pinned without sending an inquiry. Those cards get a *send inquiry* button.
- **+ add vendor:** one menu with two options.
  - *Find a Host It vendor:* pick a category and go straight to matched results for this event. Your still-missing needs are listed first.
  - *Add my own vendor:* a short form for someone outside the network (name, category, status, contact, website/Instagram, notes). These vendors are private to the event, labelled *added by you*, and editable.
- **View results / update results:** the button switches to *update* once the details that drive matching change (type, guests, date, vibe or needs).
- **Planning tools:** a to-do list with checkboxes and sticky notes, in a separate section below the vendors.
- **Delete event:** moved into a ⋯ menu, with a confirmation step.

### My Events
- **Upcoming events** come first. The next one is featured with a countdown, booking progress and to-dos left.
- **Past events** are listed below them, smaller and muted.

### Planning survey
- **Anyone can try it** and see their matched vendors.
- **Saving needs a free account.** The answers and picks carry through sign-up, so nothing is lost.
- **From a board,** results use that event's details, flag vendors already on the board, and add your picks to it in one step.

### Look and feel
- **Light / dark mode** toggle in the nav. Light is the default, and the choice is remembered.
- **Works at phone width** across every page.

### Fixes
- The edit-details form kept unsaved changes after *cancel*.
- The nav overflowed on phones.
- A vendor card nested a button inside a button.

### Placeholder content to replace before launch
- **About and Services:** placeholder copy.
- **Terms of Use and Privacy Policy:** marked drafts, to be replaced with text reviewed by legal counsel. Confirm the policy statements in them.
- **Contact form:** shows a confirmation but doesn't send anything.
- **Photos:** random placeholders, not event photography.

---

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173/hostit/. The app is served under `/hostit/` to match GitHub Pages.

Requires Node 20 or newer, as the Tailwind 4 and TypeScript 7 toolchain does.

## Demo logins

Password for every account is `hostit`. The login page has one-tap buttons for each.

| account | email | what you'll see |
|---|---|---|
| planner | `customer@hostit.com` | Maya: three event boards (two upcoming, one past), favourites, tasks and notes |
| vendor | `vendor@hostit.com` | A Couple Cocktails, in the network, with pending inquiries |
| vendor | `pantry@hostit.com` | The Pantry, a second approved vendor |
| applicant | `apply@hostit.com` | Bloom & Barrel, a vendor application awaiting review |
| admin | `admin@hostit.com` | The Host It team's review queue |

Use **reset demo data** in the footer to restore the seeded data.

## Demo script

**Visitor (signed out)**
1. Home → browse the network → a category → filter by tag → open a vendor profile.
2. Tap the heart or *plan with …*: you're asked to create a free account, then brought back.
3. Plan an event → answer five questions → see your matches → *sign up to save*. After signing up your picks are restored; confirm them into a new board.

**Planner** (`customer@hostit.com`)
1. Dashboard → *+ add event*, then cancel: you stay on the Dashboard.
2. Your events → *olivia's garden shower*:
   - Check *What you need* (tap a category to filter).
   - Filter vendors by status.
   - *+ add vendor* → a category → add a match.
   - *+ add vendor* → *add my own vendor*.
   - Add a to-do and a sticky note.
3. *Edit details* → change the guest count. *View results* becomes *update results*.
4. Account menu → account settings.

**Vendor application**
1. *Join the network* → create a vendor account → complete the profile → *submit for review*.
2. Sign in as `admin@hostit.com` → review the application → *approve & publish* (or decline with a note).
3. Sign back in as the vendor: the decision is waiting on the dashboard, and an approved vendor is now listed in its category.

**Approved vendor** (`vendor@hostit.com`): accept or decline inquiries (the planner's board updates), edit the profile and tags, and block dates in availability.

## Branches and releases

- `develop`: day-to-day work. Create branches from `develop` and open pull requests back into `develop`.
- `main`: the released version. Every push to `main` deploys the live demo to GitHub Pages (`.github/workflows/deploy.yml`).
- `initial-draft`: a snapshot of the first version, kept for reference.

## Stack

Vite, React 18, TypeScript, React Router 7, Tailwind 4.

- **State:** one reducer in `src/store/AppContext.tsx`, saved to `localStorage` under `hostit-poc-v3`.
- **Logic in `src/lib/`:**
  - `matchVendors.ts`: survey matching
  - `vendorStatus.ts`: board statuses and needs progress
  - `application.ts`: vendor application checklist
  - `events.ts`: upcoming / past
  - `theme.ts`: dark mode
- **Pages in `src/pages/`:**
  - `public/`: home, about, services, contact, legal
  - `account/`: sign-up, join, settings
  - `customer/`: dashboard, network, boards, planning
  - `vendor/`: dashboard, profile, availability, application
  - `admin/`: review queue
- **Mock data** is under `src/data/`.
