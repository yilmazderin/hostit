import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Nav } from '../components/Nav'
import { DEMO_LOGINS } from '../data/users'
import { useApp } from '../store/AppContext'
import { Field } from '../components/ui'

export function Login() {
  const { login } = useApp()
  const nav = useNavigate()
  const loc = useLocation() as { state?: { from?: string } }
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const go = (e: string, p: string) => {
    const user = login(e, p)
    if (!user) {
      setError("that didn't match a demo account. try one of the chips below.")
      return
    }
    const next = loc.state?.from ?? params.get('next')
    if (user.role === 'vendor') nav('/vendor')
    else nav(next && !next.startsWith('/vendor') ? next : '/home')
  }

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    go(email, password)
  }

  const roleHint = params.get('role')

  return (
    <div className="min-h-screen bg-paper">
      <Nav dark={false} />
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
        <div>
          <h1 className="text-5xl md:text-6xl">welcome back.</h1>
          <p className="mt-4 max-w-md text-sm text-stone">
            this is a proof of concept with hardcoded accounts. sign in as a customer to plan an event, or as a vendor to
            manage your profile and inquiries.
          </p>
          <div className="mt-10 space-y-3">
            <span className="label-caps text-stone">demo accounts · password is “hostit”</span>
            {DEMO_LOGINS.filter((d) => !roleHint || d.label === roleHint).map((d) => (
              <button
                key={d.email}
                onClick={() => go(d.email, d.password)}
                className="card flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-mist"
              >
                <div>
                  <div className="font-semibold">{d.sub}</div>
                  <div className="text-xs text-stone">{d.email}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${d.label === 'vendor' ? 'bg-sand' : 'bg-moss/60'}`}>
                  {d.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={submit} className="card h-fit space-y-5 p-8">
          <Field label="email">
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@hostit.com" autoComplete="off" />
          </Field>
          <Field label="password">
            <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="hostit" autoComplete="off" />
          </Field>
          {error && <p className="text-sm text-clay">{error}</p>}
          <button className="pill-dark w-full" type="submit">sign in</button>
        </form>
      </div>
    </div>
  )
}
