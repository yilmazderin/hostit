import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Field } from '../../components/ui'
import { useApp, type ResetStatus } from '../../store/AppContext'
import { FormShell } from './SignUp'

const PROBLEM: Record<Exclude<ResetStatus, 'valid'>, [string, string]> = {
  used: ['this link has already been used.', 'each reset link works once. request a new one if you still need to change your password.'],
  expired: ['this link has expired.', 'reset links expire after 30 minutes. request a new one to keep going.'],
  invalid: ["this link isn't valid.", "it may be incomplete or mistyped. request a new one to keep going."],
}

// Opened from the reset email, signed in or out. The token stays in the URL only; it's never shown on the page.
export function ResetPassword() {
  const { user, checkResetToken, resetPassword } = useApp()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [pw, setPw] = useState({ next: '', confirm: '' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // checked before the token's status: a successful reset spends the link, so it would read as "used"
  if (done)
    return (
      <FormShell>
        <h1 className="text-4xl md:text-5xl">your password has been updated.</h1>
        <p className="mt-3 text-sm text-stone">
          {user ? "you're still signed in. use your new password the next time you log in." : 'log in with your new password.'}
        </p>
        <Link to={user ? '/account' : '/login'} className="pill-dark mt-6">{user ? 'account settings' : 'log in'}</Link>
      </FormShell>
    )

  const status = token ? checkResetToken(token) : 'invalid'
  if (status !== 'valid') {
    const [title, sub] = PROBLEM[status]
    return (
      <FormShell>
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-stone">{sub}</p>
        <Link to={user ? '/account' : '/login?forgot=1'} className="pill-dark mt-6">request a new link</Link>
      </FormShell>
    )
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (pw.next.length < 8) return setError('use at least 8 characters for your password.')
    if (pw.next !== pw.confirm) return setError("the passwords don't match.")
    const err = resetPassword(token, pw.next)
    if (err) return setError(err)
    setPw({ next: '', confirm: '' })
    setDone(true)
  }

  return (
    <FormShell>
      <span className="label-caps text-stone">security</span>
      <h1 className="mt-2 text-4xl md:text-5xl">set a new password.</h1>
      <p className="mt-3 text-sm text-stone">choose a new password for your host it account. this link works once.</p>
      <form onSubmit={submit} className="card mt-8 space-y-5 p-6 md:p-8">
        <Field label="new password" hint="at least 8 characters">
          <input className="field h-12" type="password" autoFocus value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
        </Field>
        <Field label="confirm new password">
          <input className="field h-12" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="pill-dark w-full" type="submit" disabled={!pw.next || !pw.confirm}>update password</button>
      </form>
    </FormShell>
  )
}
