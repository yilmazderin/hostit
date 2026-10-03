import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { PlannerType } from '../../types'
import { Footer, Nav } from '../../components/Nav'
import { dashboardPath } from '../../components/RequireRole'
import { Field, Stepper } from '../../components/ui'
import { PLANNER_TYPES } from '../../data/tags'
import { isEmail } from '../../lib/validate'
import { useApp } from '../../store/AppContext'

// Planner sign-up. Vendors apply through /join instead, so the chooser comes first unless we already know.
export function SignUp() {
  const { user, signUp } = useApp()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')
  // arriving from "save" or "plan with ..." means they're planning: skip the chooser
  const [path, setPath] = useState<'choose' | 'planner'>(next || params.get('as') === 'planner' ? 'planner' : 'choose')
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [plannerType, setPlannerType] = useState<PlannerType | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const loginLink = `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`

  if (user)
    return (
      <FormShell>
        <h1 className="text-4xl">you're signed in.</h1>
        <p className="mt-3 text-sm text-stone">signed in as {user.email}.</p>
        <Link to={dashboardPath(user)} className="pill-dark mt-6">go to your dashboard</Link>
      </FormShell>
    )

  if (path === 'choose')
    return (
      <FormShell wide>
        <h1 className="text-5xl md:text-6xl">create an account.</h1>
        <p className="mt-3 text-sm text-stone">two ways in. pick the one that fits.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <button onClick={() => setPath('planner')} className="card group flex flex-col p-8 text-left transition-shadow hover:shadow-[0_16px_40px_-16px_rgba(48,44,44,0.35)]">
            <span className="label-caps text-stone">user account</span>
            <span className="mt-3 text-3xl font-bold tracking-tight">plan events</span>
            <span className="mt-3 text-sm text-stone">for planning your own events, events for a business, or events you plan professionally. save vendors, build event boards, send inquiries.</span>
            <span className="pill-dark mt-8 self-start">create a user account</span>
          </button>
          <Link to="/join" className="card group flex flex-col p-8 transition-shadow hover:shadow-[0_16px_40px_-16px_rgba(48,44,44,0.35)]">
            <span className="label-caps text-stone">vendor account</span>
            <span className="mt-3 text-3xl font-bold tracking-tight">join the network</span>
            <span className="mt-3 text-sm text-stone">for businesses offering event services. apply with your business profile; the host it team reviews every application before it goes live.</span>
            <span className="pill-ghost mt-8 self-start">apply to join</span>
          </Link>
        </div>
        <p className="mt-8 text-sm text-stone">already have an account? <Link to={loginLink} className="text-ink underline">log in</Link></p>
      </FormShell>
    )

  const continueToType = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('add your name.')
    if (!isEmail(form.email)) return setError("that email doesn't look right.")
    if (form.password.length < 8) return setError('use at least 8 characters for your password.')
    setError('')
    setStep(2)
  }
  const create = (e: FormEvent) => {
    e.preventDefault()
    const res = signUp({ ...form, plannerType: plannerType ?? undefined })
    if (res.error) {
      setError(res.error)
      // the only errors left at this point are about step one's fields
      setStep(1)
      return
    }
    nav(next && next.startsWith('/') ? next : '/dashboard')
  }

  return (
    <FormShell>
      <span className="label-caps text-stone">user account</span>
      <h1 className="mt-2 text-4xl md:text-5xl">{step === 1 ? 'create your account.' : 'what best describes you?'}</h1>
      <div className="mt-6 max-w-xs"><Stepper step={step} total={2} /></div>
      {step === 1 ? (
        <form onSubmit={continueToType} className="mt-8 space-y-4">
          <Field label="name"><input className="field h-12" autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></Field>
          <Field label="email"><input className="field h-12" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></Field>
          <Field label="password" hint="at least 8 characters">
            <input className="field h-12" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <span className="text-sm text-stone">have an account? <Link to={loginLink} className="text-ink underline">log in</Link></span>
            <button className="pill-dark" type="submit">continue</button>
          </div>
        </form>
      ) : (
        <form onSubmit={create} className="mt-8">
          <p className="text-sm text-stone">it helps us shape host it. everyone gets the same tools for now.</p>
          <div className="mt-5 space-y-2" role="radiogroup" aria-label="what best describes you">
            {PLANNER_TYPES.map((t) => (
              <label
                key={t.value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition-colors ${plannerType === t.value ? 'border-ink bg-surface' : 'border-mist-deep hover:border-ink'}`}
              >
                <input type="radio" name="planner-type" className="h-4 w-4 accent-ink" checked={plannerType === t.value} onChange={() => setPlannerType(t.value)} />
                {t.label}
              </label>
            ))}
          </div>
          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-ink" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>
              i agree to the <Link to="/terms" target="_blank" className="underline">terms of use</Link> and the{' '}
              <Link to="/privacy" target="_blank" className="underline">privacy policy</Link>.
            </span>
          </label>
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
          <div className="mt-8 flex items-center justify-between gap-4">
            <button type="button" className="label-caps text-stone hover:text-ink" onClick={() => setStep(1)}>← back</button>
            <button className="pill-dark" type="submit" disabled={!plannerType || !agreed}>create account</button>
          </div>
        </form>
      )}
    </FormShell>
  )
}

export function FormShell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-paper">
      <Nav dark={false} />
      <div className="container-x py-14 md:py-20">
        <div className={wide ? '' : 'max-w-xl'}>{children}</div>
      </div>
      <Footer />
    </div>
  )
}
