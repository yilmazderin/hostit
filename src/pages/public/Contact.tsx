import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Footer, Nav } from '../../components/Nav'
import { Field, Hero } from '../../components/ui'
import { useApp } from '../../store/AppContext'
import { EMAIL } from '../../lib/validate'

const TOPICS = [
  { value: 'planning help', sub: 'finding vendors, the planning survey, or your event boards.' },
  { value: 'joining the network', sub: 'applying as a vendor, or an application in progress.' },
  { value: 'my account', sub: 'signing in, your details, or closing your account.' },
  { value: 'something else', sub: 'ideas, feedback, or anything we missed.' },
]


type Form = { name: string; email: string; topic: string; message: string }
type Errors = Partial<Record<keyof Form, string>>

function validate(f: Form): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'add your name.'
  if (!f.email.trim()) e.email = 'add your email so we can reply.'
  else if (!EMAIL.test(f.email.trim())) e.email = "that email doesn't look right."
  if (!f.topic) e.topic = 'pick a topic.'
  if (!f.message.trim()) e.message = 'add a message.'
  else if (f.message.trim().length < 10) e.message = 'tell us a little more.'
  return e
}

// A mock: nothing is sent or stored, the form just confirms in place.
export function Contact() {
  const { user } = useApp()
  const [form, setForm] = useState<Form>({ name: user?.name ?? '', email: user?.email ?? '', topic: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const set = (key: keyof Form, value: string) => {
    setForm({ ...form, [key]: value })
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate(form)
    setErrors(e)
    const first = (Object.keys(e) as (keyof Form)[])[0]
    if (first) document.getElementById(`contact-${first}`)?.focus()
    else setSent(true)
  }

  const fieldProps = (key: keyof Form) => ({
    id: `contact-${key}`,
    value: form[key],
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `contact-${key}-error` : undefined,
  })
  const error = (key: keyof Form) =>
    errors[key] && (
      <p id={`contact-${key}-error`} className="mt-1.5 text-xs text-danger">
        {errors[key]}
      </p>
    )
  const invalid = 'aria-[invalid=true]:border-danger'

  return (
    <>
      <Nav />
      <Hero title="contact" subtitle="questions, ideas, or something we can help with? send us a note." compact />
      <section className="container-x grid gap-12 py-16 md:py-24 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div>
          <span className="label-caps text-stone">get in touch</span>
          <h2 className="mt-3 text-4xl md:text-5xl">say hello.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone md:text-base">
            whether you're planning something, thinking about joining the network, or need a hand with your account, send a
            note and the host it team will get back to you.
          </p>
          <dl className="mt-10 divide-y divide-mist border-y border-mist">
            {TOPICS.map((t) => (
              <div key={t.value} className="py-4">
                <dt className="font-semibold lowercase">{t.value}</dt>
                <dd className="mt-0.5 text-sm text-stone">{t.sub}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-stone">
            prefer instagram? find us at{' '}
            <a href="https://instagram.com/host.itevents" target="_blank" rel="noreferrer" className="text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink">
              @host.itevents
            </a>
            .
          </p>
          <p className="mt-3 text-sm text-stone">
            looking for vendors? <Link to="/network" className="text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink">the network</Link> is open to browse.
          </p>
        </div>

        {sent ? (
          <div role="status" className="card rise h-fit p-6 md:p-10">
            <span className="label-caps text-stone">message received</span>
            <h2 className="mt-3 text-3xl md:text-4xl">thanks, {form.name.trim().split(/\s+/)[0].toLowerCase()}.</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone">
              we've got your note about {form.topic}. we'll get back to you at <span className="text-ink">{form.email.trim()}</span>.
            </p>
            <p className="mt-6 rounded-xl bg-mist/60 p-4 text-xs text-stone">
              this is a proof of concept: the form doesn't send or store anything yet.
            </p>
            <button
              className="pill-ghost mt-8"
              onClick={() => {
                setForm({ ...form, topic: '', message: '' })
                setSent(false)
              }}
            >
              send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="card h-fit space-y-5 p-6 md:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Field label="name">
                  <input className={`field h-12 ${invalid}`} {...fieldProps('name')} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
                </Field>
                {error('name')}
              </div>
              <div>
                <Field label="email">
                  <input className={`field h-12 ${invalid}`} type="email" {...fieldProps('email')} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
                </Field>
                {error('email')}
              </div>
            </div>
            <div>
              <Field label="topic">
                <select
                  className={`field-select h-12 ${form.topic ? '' : 'text-stone'} ${invalid}`}
                  {...fieldProps('topic')}
                  onChange={(e) => set('topic', e.target.value)}
                >
                  <option value="" disabled>choose a topic</option>
                  {TOPICS.map((t) => (
                    <option key={t.value} value={t.value} className="text-ink">{t.value}</option>
                  ))}
                </select>
              </Field>
              {error('topic')}
            </div>
            <div>
              <Field label="message">
                <textarea className={`field min-h-40 ${invalid}`} {...fieldProps('message')} onChange={(e) => set('message', e.target.value)} placeholder="tell us a little about it" />
              </Field>
              {error('message')}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <span className="text-xs text-stone">we'll only use your details to reply.</span>
              <button className="pill-dark" type="submit">send message</button>
            </div>
          </form>
        )}
      </section>
      <Footer />
    </>
  )
}
