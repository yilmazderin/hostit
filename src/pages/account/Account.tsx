import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { dashboardPath } from '../../components/RequireRole'
import { Field } from '../../components/ui'
import { PLANNER_TYPES } from '../../data/tags'
import { LISTING_LABEL, listingOf } from '../../lib/application'
import { formatDate } from '../../lib/format'
import { useApp } from '../../store/AppContext'
import { DemoInbox } from './DemoInbox'

const ROLE_LABEL = { customer: 'user account', vendor: 'vendor account', admin: 'host it team' }

const maskEmail = (email: string) => {
  const at = email.lastIndexOf('@')
  return `${email.slice(0, 1)}•••${email.slice(at)}`
}

export function Account() {
  const { user, updateAccount, logout, myVendor, requestPasswordReset } = useApp()
  const nav = useNavigate()
  const [profile, setProfile] = useState(() => ({ name: user?.name ?? '', email: user?.email ?? '' }))
  const [msg, setMsg] = useState<{ section: string; text: string; ok: boolean } | null>(null)
  const [reset, setReset] = useState<{ to: string; link?: string } | null>(null)
  const [resetError, setResetError] = useState('')
  if (!user) return null

  const report = (section: string, error: string | null, ok: string) => setMsg({ section, text: error ?? ok, ok: !error })
  const saveProfile = (e: FormEvent) => {
    e.preventDefault()
    if (!profile.name.trim()) return report('profile', 'add your name.', '')
    report('profile', updateAccount({ name: profile.name.trim(), email: profile.email }), 'saved.')
  }
  // With a real auth provider this is its own reset call (e.g. Supabase resetPasswordForEmail, Firebase
  // sendPasswordResetEmail): it emails the link itself and the app never sees it. The POC hands it back for the demo inbox.
  const changePassword = () => {
    const res = requestPasswordReset(user.email)
    if (res.error) return setResetError(res.error)
    setResetError('')
    setReset({ to: user.email, link: res.link })
  }
  const note = (section: string) =>
    msg?.section === section && msg.text ? <p className={`text-sm ${msg.ok ? 'text-stone' : 'text-danger'}`}>{msg.text}</p> : null

  return (
    <>
      <Nav />
      <section className="keep-dark bg-ink text-paper">
        <div className="container-x py-12">
          <Link to={dashboardPath(user)} className="label-caps text-paper/60 hover:text-paper">← dashboard</Link>
          <h1 className="mt-3 text-4xl md:text-5xl">account settings</h1>
          <p className="mt-2 text-sm text-paper/70">{ROLE_LABEL[user.role]} · {user.email}</p>
        </div>
      </section>

      <section className="container-x py-12">
        <div className="max-w-3xl space-y-6">
        <Panel title="profile">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="name"><input className="field h-12" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} autoComplete="name" /></Field>
              <Field label="email"><input className="field h-12" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} autoComplete="email" /></Field>
            </div>
            <div className="flex items-center justify-between gap-4">
              {note('profile') ?? <span />}
              <button className="pill-dark" type="submit">save</button>
            </div>
          </form>
        </Panel>

        {user.role !== 'admin' && (
          <Panel title="account type" sub="what best describes you. everyone gets the same tools for now.">
            <div className="space-y-2" role="radiogroup" aria-label="account type">
              {PLANNER_TYPES.map((t) => (
                <label
                  key={t.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition-colors ${user.plannerType === t.value ? 'border-ink' : 'border-mist-deep hover:border-ink'}`}
                >
                  <input
                    type="radio"
                    name="planner-type"
                    className="h-4 w-4 accent-ink"
                    checked={user.plannerType === t.value}
                    onChange={() => report('type', updateAccount({ plannerType: t.value }), 'saved.')}
                  />
                  {t.label}
                </label>
              ))}
            </div>
            <div className="mt-3">{note('type')}</div>
          </Panel>
        )}

        {user.role !== 'admin' &&
          (myVendor ? (
            <Panel title="your business" sub="your application and public profile are managed in the vendor portal.">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <span><span className="font-semibold">{myVendor.name}</span> · {LISTING_LABEL[listingOf(myVendor)]}</span>
                <Link to="/vendor" className="pill-ghost">vendor portal</Link>
              </div>
            </Panel>
          ) : (
            <Panel title="host it network" sub="run an event business? apply with this account. your events and planning stay as they are.">
              <Link to="/join" className="pill-ghost">apply to join the network</Link>
            </Panel>
          ))}

        <Panel title="security">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm">
              <span className="block font-semibold">password</span>
              <span className="block text-stone">we'll email you a secure link to set a new one.</span>
            </div>
            <button className="pill-ghost" onClick={changePassword}>{reset ? 'send a new link' : 'change password'}</button>
          </div>
          {reset && (
            <p className="mt-4 text-sm text-stone">
              we've sent a reset link to <span className="font-semibold text-ink">{maskEmail(reset.to)}</span>. it works once and expires in 30 minutes.
            </p>
          )}
          {resetError && <p className="mt-4 text-sm text-danger">{resetError}</p>}
          {reset?.link && (
            <div className="mt-5"><DemoInbox to={maskEmail(reset.to)} link={reset.link} /></div>
          )}
        </Panel>

        <Panel title="legal">
          <p className="text-sm text-stone">
            {user.termsAcceptedAt ? `you accepted the terms of use and privacy policy on ${formatDate(user.termsAcceptedAt.slice(0, 10))}. ` : ''}
            read the <Link to="/terms" className="text-ink underline">terms of use</Link> and <Link to="/privacy" className="text-ink underline">privacy policy</Link>.
          </p>
        </Panel>

        <div className="flex justify-end">
          <button
            className="pill-ghost"
            onClick={() => {
              logout()
              nav('/')
            }}
          >
            log out
          </button>
        </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="card p-6 md:p-8">
      <h2 className="text-xl">{title}</h2>
      {sub && <p className="mt-1 text-sm text-stone">{sub}</p>}
      <div className="mt-5">{children}</div>
    </div>
  )
}
