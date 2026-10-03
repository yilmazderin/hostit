import { Link } from 'react-router-dom'
import { LegalList, LegalPage, type LegalSection } from './LegalPage'

const a = 'text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink'
const term = 'font-semibold text-ink'

const SECTIONS: LegalSection[] = [
  {
    id: 'collect',
    title: "what's collected",
    body: (
      <>
        <p>browsing the network doesn't need an account. when you create one or use the planning tools, host it keeps:</p>
        <LegalList
          items={[
            <><span className={term}>account details:</span> your name, email address and password.</>,
            <>
              <span className={term}>account type:</span> if you're a planner, the option you choose at sign-up: planning for
              yourself, for a business, or planning professionally.
            </>,
            <>
              <span className={term}>event details:</span> what you add while planning, such as an event's name, type, date,
              time, location, guest count and vibe, your planning survey answers, the vendors on your boards, and your to-dos
              and notes.
            </>,
            <>
              <span className={term}>vendor application details:</span> if you apply to join the network, your business name,
              category and location, your profile (description, services, photos and links), your availability, and where
              your application stands.
            </>,
            <><span className={term}>inquiries:</span> messages between planners and vendors, and their status.</>,
          ]}
        />
        <p>your device also remembers a few preferences, like light or dark mode.</p>
      </>
    ),
  },
  {
    id: 'use',
    title: "how it's used",
    body: (
      <LegalList
        items={[
          'to create and run your account, and sign you in.',
          'to power the planning tools: matching vendors to your survey answers, your event boards, and inquiries.',
          'to review vendor applications and show approved listings in the network.',
          'to send you messages about your account, your application or your inquiries, such as a decision on an application.',
          'to understand how host it is used and improve it. the account type you choose helps shape what we build next.',
        ]}
      />
    ),
  },
  {
    id: 'share',
    title: "what's shared",
    body: (
      <>
        <p>
          <span className={term}>when you send an inquiry,</span> the vendor you contact sees your name, the event's name,
          type, date, guest count and vibe, and your message, so they can reply. nothing else from your boards is shared.
        </p>
        <p>
          <span className={term}>approved vendor profiles are public.</span> anyone browsing the network can see a listed
          vendor's business name, profile, photos and the details they choose to show.
        </p>
        <p>
          beyond that, information is only shared with services that help run host it, as needed to provide it, or where
          the law requires. host it doesn't sell your personal information.
        </p>
      </>
    ),
  },
  {
    id: 'choices',
    title: 'retention and your choices',
    body: (
      <>
        <p>
          your information is kept while your account is open. some of it may be kept longer where the law requires.
        </p>
        <LegalList
          items={[
            'update your details any time in your account settings.',
            'edit or delete your event boards whenever you like.',
            'vendors can update their profile and availability from their dashboard.',
            'to close your account, or to ask for a copy of your information or for it to be deleted, get in touch.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'contact',
    title: 'contact',
    body: (
      <>
        <p>
          questions about this policy or your information? reach us through the{' '}
          <Link to="/contact" className={a}>contact page</Link>.
        </p>
        <p>if this policy changes in a significant way, we'll say so on the site before the change takes effect.</p>
      </>
    ),
  },
]

export function Privacy() {
  return (
    <LegalPage
      title="privacy policy"
      subtitle="what host it collects, why, and what you can do about it."
      intro={
        <p>
          this policy explains how host it handles the information you share while browsing the network, planning events or
          applying to join as a vendor. it works alongside our <Link to="/terms" className={a}>terms of use</Link>.
        </p>
      }
      sections={SECTIONS}
    />
  )
}
