import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CategorySlug } from '../../types'
import { dashboardPath } from '../../components/RequireRole'
import { Field, Stepper } from '../../components/ui'
import { CATEGORIES } from '../../data/categories'
import { isEmail } from '../../lib/validate'
import { useApp } from '../../store/AppContext'
import { FormShell } from './SignUp'

const STEPS = [
  ['create your vendor account', 'a login for you and a draft listing for your business.'],
  ['build your profile', 'photos, services, who you work best with. take your time; nothing is public yet.'],
  ['submit for review', 'the host it team reviews every application by hand.'],
  ['go live', "once approved, planners can find you, save you and send inquiries."],
]

// Vendor sign-up. Creating the account starts an application; it doesn't put anyone in the network.
export function JoinNetwork() {
  const { user, signUp } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({ name: '', email: '', password: '', business: '', category: 'food-drink' as CategorySlug, location: 'Windsor, ON' })
  const [agreed, setAgreed] = useState(false)
  const [understood, setUnderstood] = useState(false)
  const [error, setError] = useState('')

  if (user)
    return (
      <FormShell>
        <h1 className="text-4xl">you're signed in.</h1>
        <p className="mt-3 text-sm text-stone">
          signed in as {user.email}. to apply with a different business, log out and create a vendor account.
        </p>
        <Link to={dashboardPath(user)} className="pill-dark mt-6">go to your dashboard</Link>
      </FormShell>
    )

  const toBusiness = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('add your name.')
    if (!isEmail(form.email)) return setError("that email doesn't look right.")
    if (form.password.length < 8) return setError('use at least 8 characters for your password.')
    setError('')
    setStep(2)
  }
  const apply = (e: FormEvent) => {
    e.preventDefault()
    if (!form.business.trim()) return setError('add your business name.')
    const res = signUp({
      name: form.name,
      email: form.email,
      password: form.password,
      business: { name: form.business, categorySlug: form.category, location: form.location },
    })
    if (res.error) {
      setError(res.error)
      setStep(1)
      return
    }
    nav('/vendor')
  }

  return (
    <FormShell wide>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <span className="label-caps text-stone">vendor account</span>
          <h1 className="mt-2 text-5xl md:text-6xl">join the network.</h1>
          <p className="mt-4 max-w-md text-sm text-stone">
            host it is a curated network of local event vendors and experiences. here's how a business gets in.
          </p>
          <ol className="mt-8 space-y-5">
            {STEPS.map(([title, sub], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-mist-deep text-xs font-semibold">{i + 1}</span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-stone">{sub}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-md rounded-2xl bg-mist/60 p-4 text-xs text-stone">
            applying doesn't guarantee a place in the network. we keep it curated so planners can trust what they find.
          </p>
        </div>

        <div className="card h-fit p-6 md:p-8">
          <div className="max-w-xs"><Stepper step={step} total={2} /></div>
          {step === 1 ? (
            <form onSubmit={toBusiness} className="mt-6 space-y-4">
              <h2 className="text-2xl">about you</h2>
              <Field label="your name"><input className="field h-12" autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></Field>
              <Field label="email"><input className="field h-12" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></Field>
              <Field label="password" hint="at least 8 characters">
                <input className="field h-12" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
              </Field>
              {error && <p className="text-sm text-danger">{error}</p>}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <span className="text-sm text-stone">already applied? <Link to="/login" className="text-ink underline">log in</Link></span>
                <button className="pill-dark" type="submit">continue</button>
              </div>
            </form>
          ) : (
            <form onSubmit={apply} className="mt-6 space-y-4">
              <h2 className="text-2xl">your business</h2>
              <Field label="business name"><input className="field h-12" autoFocus value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="category">
                  <select className="field-select h-12" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CategorySlug })}>
                    {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="based in"><input className="field h-12" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
              </div>
              <div className="space-y-3 pt-2 text-sm">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-ink" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <span>
                    i agree to the <Link to="/terms" target="_blank" className="underline">terms of use</Link> and the{' '}
                    <Link to="/privacy" target="_blank" className="underline">privacy policy</Link>.
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-ink" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
                  <span>
                    i understand that submitting an application doesn't guarantee acceptance into the host it network (
                    <Link to="/terms#vendors" target="_blank" className="underline">vendor terms</Link>).
                  </span>
                </label>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button type="button" className="label-caps text-stone hover:text-ink" onClick={() => setStep(1)}>← back</button>
                <button className="pill-dark" type="submit" disabled={!agreed || !understood}>create vendor account</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </FormShell>
  )
}
