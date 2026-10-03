import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { dashboardPath } from '../components/RequireRole'
import { DEMO_LOGINS } from '../data/users'
import { useApp } from '../store/AppContext'
import { Field } from '../components/ui'
import { FormShell } from './account/SignUp'

const CHIP: Record<string, string> = {
  planner: 'bg-moss/60',
  vendor: 'bg-sand',
  applicant: 'bg-honey/60',
  admin: 'bg-sky/60',
}

export function Login() {
  const { user, login } = useApp()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const next = params.get('next')

  if (user) return <Navigate to={dashboardPath(user)} replace />

  const go = (e: string, p: string) => {
    const signedIn = login(e, p)
    if (!signedIn) {
      setError("that email and password don't match an account.")
      return
    }
    // a planner returns to where they were headed; other accounts start at their own dashboard
    nav(signedIn.role === 'customer' && next?.startsWith('/') ? next : dashboardPath(signedIn))
  }

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    go(email, password)
  }

  return (
    <FormShell wide>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.1fr]">
        <div>
          <h1 className="text-5xl md:text-6xl">welcome back.</h1>
          <form onSubmit={submit} className="card mt-8 space-y-5 p-8">
            <Field label="email">
              <input className="field h-12" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </Field>
            <Field label="password">
              <input className="field h-12" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </Field>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button className="pill-dark w-full" type="submit">log in</button>
          </form>
          <p className="mt-6 text-sm text-stone">
            new to host it? <Link to={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-ink underline">create an account</Link>
            {' · '}a business? <Link to="/join" className="text-ink underline">join the network</Link>
          </p>
        </div>
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
