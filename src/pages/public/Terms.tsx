import { Link } from 'react-router-dom'
import { LegalList, LegalPage, type LegalSection } from './LegalPage'

const a = 'text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink'

// The sign-up forms link here, and to #vendors; keep that id.
const SECTIONS: LegalSection[] = [
  {
    id: 'accounts',
    title: 'accounts and acceptable use',
    body: (
      <>
        <p>
          anyone can browse the network and view vendor profiles without an account. saving plans, using event boards and
          sending inquiries need a free account.
        </p>
        <LegalList
          items={[
            'give accurate information when you sign up, and keep it up to date.',
            "keep your login details to yourself. you're responsible for what happens under your account.",
            "if you sign up on behalf of a business, make sure you're allowed to act for it.",
          ]}
        />
        <p>when you use host it, please don't:</p>
        <LegalList
          items={[
            "post anything unlawful, misleading or hateful, or anything that infringes someone else's rights.",
            'pretend to be another person or business.',
            'use inquiries to send spam, promotions or anything unrelated to planning an event.',
            "copy, scrape or resell the network's listings.",
            'try to break, overload or get around the security of the site.',
          ]}
        />
        <p>we may suspend or close an account that breaks these terms.</p>
      </>
    ),
  },
  {
    id: 'planners',
    title: 'planners',
    body: (
      <>
        <p>
          the planning survey and the vendors it suggests are a starting point, not a recommendation or a promise that a
          vendor is right for your event. availability comes from vendors and can change, so confirm the details with them
          directly.
        </p>
        <p>
          your event boards aren't public. when you send an inquiry, the vendor you contact sees the event details described
          in our <Link to="/privacy#share" className={a}>privacy policy</Link>.
        </p>
        <p>
          host it isn't a party to anything you agree with a vendor. quotes, deposits, contracts, cancellations and the
          services themselves are between you and the vendor.
        </p>
      </>
    ),
  },
  {
    id: 'vendors',
    title: 'vendors',
    body: (
      <>
        <p>
          host it is a curated network. to join, you create a vendor account and submit an application with your business
          profile.
        </p>
        <p>
          <strong className="font-semibold text-ink">
            submitting an application does not guarantee acceptance into the host it network.
          </strong>{' '}
          host it reviews every application and may approve or decline it. host it may also remove or suspend a listing at
          any time, for example if its information is inaccurate, it no longer fits the network, or these terms are broken.
        </p>
        <p>until an application is approved, the listing isn't visible to people browsing the network.</p>
        <p>as a vendor, you agree to:</p>
        <LegalList
          items={[
            'keep your profile, services and availability accurate and up to date.',
            'only upload photos and content you have the rights to use.',
            'hold any licences, permits and insurance your services require.',
            'respond to inquiries in good faith, and honour the agreements you make with planners.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'content',
    title: 'content you post',
    body: (
      <>
        <p>you keep ownership of what you post on host it: photos, descriptions, event details, notes and messages.</p>
        <p>
          by posting it, you give host it permission to store, display and share it as needed to run the service. for
          example, an approved vendor's photos and description appear on their public profile, and a planner's event details
          go to the vendors they send inquiries to.
        </p>
        <p>we may remove content that breaks these terms.</p>
      </>
    ),
  },
  {
    id: 'inquiries',
    title: 'inquiries between planners and vendors',
    body: (
      <>
        <p>
          an inquiry is a message from a planner to a vendor about a specific event. sending one shares that event's details
          with the vendor so they can reply.
        </p>
        <p>
          inquiries and their statuses help both sides keep track. they aren't contracts or bookings: pricing, deposits,
          payment and the details of the work are agreed directly between the planner and the vendor.
        </p>
        <p>please keep inquiries to genuine event planning.</p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'limitation of liability',
    body: (
      <>
        <p>
          host it is provided "as is". we work to keep the network accurate, but we don't guarantee that listings,
          availability or survey matches are complete, current or free of errors.
        </p>
        <p>
          vendors are independent businesses, not employees or agents of host it. reviewing an application doesn't mean we
          guarantee the quality, safety or legality of a vendor's services.
        </p>
        <p>
          to the extent the law allows, host it isn't liable for indirect or consequential losses, or for losses arising from
          arrangements between planners and vendors. nothing in these terms limits rights you have by law that can't be
          limited.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'changes to these terms',
    body: (
      <>
        <p>
          we may update these terms as host it grows. if a change is significant, we'll say so on the site before it takes
          effect. continuing to use your account after a change means you accept the updated terms.
        </p>
        <p>
          questions about these terms? reach us through the <Link to="/contact" className={a}>contact page</Link>.
        </p>
      </>
    ),
  },
]

export function Terms() {
  return (
    <LegalPage
      title="terms of use"
      subtitle="the ground rules for planners, vendors and everyone browsing the network."
      intro={
        <p>
          host it is a curated local network for discovering event vendors, services and experiences in windsor-essex, with
          planning tools for the people organizing events. these terms apply to everyone who uses it: visitors browsing the
          network, planners with an account, and vendors who apply to or are listed in the network. by creating an account,
          you agree to these terms and to our <Link to="/privacy" className={a}>privacy policy</Link>.
        </p>
      }
      sections={SECTIONS}
    />
  )
}
