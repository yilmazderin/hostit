import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { dashboardPath } from '../components/RequireRole'
import { DEMO_LOGINS } from '../data/users'
import { isEmail } from '../lib/validate'
import { useApp } from '../store/AppContext'
import { Field } from '../components/ui'
import { DemoInbox } from './account/DemoInbox'
import { FormShell } from './account/SignUp'

const CHIP: Record<string, string> = {
  planner: 'bg-moss/60',
  vendor: 'bg-sand',
  applicant: 'bg-honey/60',
  admin: 'bg-sky/60',
}

export function Login() {
  const { user, login, requestPasswordReset } = useApp()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [sent, setSent] = useState<{ email: string; link?: string } | null>(null)
  const [resetError, setResetError] = useState('')
  const next = params.get('next')
  const forgot = params.get('forgot') === '1'

  if (user) return <Navigate to={dashboardPath(user)} replace />

  const go = (e: string, p: string) => {
    const signedIn = login(e, p)
    if (!signedIn) {
      setError("that email and password don't match an account.")
      return
    }
    // back to where they were headed, else the dashboard they used last (host it staff: the review queue)
    nav(signedIn.role !== 'admin' && next?.startsWith('/') ? next : dashboardPath(signedIn))
  }

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    go(email, password)
  }

  const setForgot = (open: boolean) => {
    setResetError('')
    setSent(null)
    setParams((p) => {
      const n = new URLSearchParams(p)
      if (open) n.set('forgot', '1')
      else n.delete('forgot')
      return n
    })
  }
  // the same answer whether or not the account exists, so the form can't be used to probe for accounts
  const sendReset = (ev: FormEvent) => {
    ev.preventDefault()
    if (!isEmail(resetEmail)) return setResetError("that email doesn't look right.")
    const res = requestPasswordReset(resetEmail)
    if (res.error) return setResetError(res.error)
    setResetError('')
    setSent({ email: resetEmail.trim(), link: res.link })
  }

  return (
    <FormShell wide>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.1fr]">
        {forgot ? (
          <div>
            <h1 className="text-5xl md:text-6xl">reset your password.</h1>
            <p className="mt-3 text-sm text-stone">enter the email you log in with and we'll send you a link to set a new password.</p>
            <form onSubmit={sendReset} className="card mt-8 space-y-5 p-8">
              <Field label="email">
                <input className="field h-12" type="email" autoFocus value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} autoComplete="email" />
              </Field>
              {resetError && <p className="text-sm text-danger">{resetError}</p>}
              {sent && (
                <p className="text-sm text-stone">
                  if an account exists for <span className="break-all font-semibold text-ink">{sent.email}</span>, we've sent a reset link. it works
                  once and expires in 30 minutes.
                </p>
              )}
              <button className="pill-dark w-full" type="submit">{sent ? 'send another link' : 'send reset link'}</button>
            </form>
            {sent?.link && <div className="mt-6"><DemoInbox to={sent.email} link={sent.link} /></div>}
            <button type="button" onClick={() => setForgot(false)} className="label-caps mt-6 text-stone hover:text-ink">← back to log in</button>
          </div>
        ) : (
          <div>
            <h1 className="text-5xl md:text-6xl">welcome back.</h1>
            <form onSubmit={submit} className="card mt-8 space-y-5 p-8">
              <Field label="email">
                <input className="field h-12" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </Field>
              <div>
                <Field label="password">
                  <input className="field h-12" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                </Field>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email)
                    setForgot(true)
                  }}
                  className="mt-2 text-xs text-stone underline hover:text-ink"
                >
                  forgot password?
                </button>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <button className="pill-dark w-full" type="submit">log in</button>
            </form>
            <p className="mt-6 text-sm text-stone">
              new to host it? <Link to={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-ink underline">create an account</Link>
              {' · '}a business? <Link to="/join" className="text-ink underline">join the network</Link>
            </p>
          </div>
        )}
        <div>
          <span className="label-caps text-stone">demo accounts · password is “hostit”</span>
          <p className="mt-2 text-xs text-stone">this is a proof of concept. tap an account to sign in as it.</p>
          <div className="mt-4 space-y-3">
            {DEMO_LOGINS.map((d) => (
              <button key={d.email} onClick={() => go(d.email, d.password)} className="card flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-mist">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{d.sub}</div>
                  <div className="truncate text-xs text-stone">{d.email}</div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink ${CHIP[d.label]}`}>{d.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </FormShell>
  )
}
