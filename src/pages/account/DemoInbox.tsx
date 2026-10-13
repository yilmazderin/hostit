import { Link } from 'react-router-dom'

// The POC has no mail server, so the reset email a real auth provider would send is shown here instead.
export function DemoInbox({ to, link }: { to: string; link: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-mist-deep p-3 md:p-5">
      <span className="label-caps text-stone">demo inbox · this proof of concept doesn't send email</span>
      <div className="mt-3 rounded-xl bg-paper p-3 text-sm md:p-4">
        <div className="break-all text-xs text-stone">from host it · to {to}</div>
        <div className="mt-1 font-semibold">reset your host it password</div>
        <p className="mt-2 text-stone">
          someone asked to reset the password for your host it account. this link works once and expires in 30 minutes.
          if it wasn't you, ignore this email; your password stays the same.
        </p>
        <Link to={link} className="pill-dark mt-4">set a new password</Link>
      </div>
    </div>
  )
}
