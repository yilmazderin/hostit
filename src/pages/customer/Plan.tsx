import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { CategorySlug, Survey, VibeTag } from '../../types'
import { Nav } from '../../components/Nav'
import { Chip, Stepper } from '../../components/ui'
import { CATEGORIES } from '../../data/categories'
import { EVENT_TYPES, GUEST_PRESETS, VIBE_TAGS } from '../../data/tags'
import { useApp } from '../../store/AppContext'

const TOTAL = 5

export function Plan() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { myEvents } = useApp()
  const ctxEvent = myEvents.find((e) => e.id === params.get('event'))
  const [step, setStep] = useState(1)
  const [survey, setSurvey] = useState<Survey>({
    type: ctxEvent?.type ?? null,
    guests: ctxEvent?.guests ?? 50,
    date: ctxEvent?.date ?? '',
    vibes: ctxEvent?.vibes ?? [],
    needs: ctxEvent?.needs ?? [],
  })

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  const canNext = [
    survey.type !== null,
    survey.guests > 0,
    survey.date !== '',
    survey.vibes.length > 0,
    survey.needs.length > 0,
  ][step - 1]

  const next = () => {
    if (step < TOTAL) return setStep(step + 1)
    nav(`/plan/results${ctxEvent ? `?event=${ctxEvent.id}` : ''}`, { state: { survey } })
  }

  const questions = [
    "what are you planning?",
    'how many people?',
    'when is it?',
    "what's the vibe?",
    'what do you need?',
  ]
  const hints = [
    'pick the closest fit. you can change it later.',
    'a rough number is fine.',
    'we only show vendors who are free that day.',
    'choose as many as feel right.',
    'we\'ll curate a shortlist for each.',
  ]

  return (
    <div className="flex min-h-screen flex-col bg-ink text-paper">
      <Nav />
      <div className="container-x flex flex-1 flex-col py-10">
        <Stepper step={step} total={TOTAL} />
        <div className="rise my-auto py-12" key={step}>
          <p className="label-caps text-paper/50">{ctxEvent ? `adding to ${ctxEvent.name}` : "let's plan together"}</p>
          <h1 className="mt-3 text-5xl md:text-6xl">{questions[step - 1]}</h1>
          <p className="mt-3 text-sm text-paper/60">{hints[step - 1]}</p>

          <div className="mt-10">
            {step === 1 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setSurvey({ ...survey, type: t.value })}
                    className={`rounded-2xl border p-5 text-left transition-colors ${survey.type === t.value ? 'border-paper bg-paper text-ink' : 'border-paper/20 hover:border-paper/60'}`}
                  >
                    <div className="text-2xl">{t.emoji}</div>
                    <div className="mt-3 text-lg font-bold lowercase">{t.value}</div>
                    <div className={`mt-1 text-xs ${survey.type === t.value ? 'text-stone' : 'text-paper/60'}`}>{t.blurb}</div>
                  </button>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="max-w-lg">
                <div className="text-7xl font-bold tabular-nums">{survey.guests}</div>
                <input
                  type="range" min={2} max={400} step={1} value={survey.guests}
                  onChange={(e) => setSurvey({ ...survey, guests: Number(e.target.value) })}
                  className="mt-6 w-full accent-paper"
                />
                <div className="mt-6 flex flex-wrap gap-2">
                  {GUEST_PRESETS.map((n) => (
                    <Chip key={n} tone="paper" active={survey.guests === n} onClick={() => setSurvey({ ...survey, guests: n })}>{n}</Chip>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <input
                type="date"
                value={survey.date}
                onChange={(e) => setSurvey({ ...survey, date: e.target.value })}
                className="rounded-2xl border border-paper/30 bg-transparent px-6 py-5 text-3xl text-paper [color-scheme:dark] focus:border-paper"
              />
            )}
            {step === 4 && (
              <div className="flex max-w-2xl flex-wrap gap-2">
                {VIBE_TAGS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSurvey({ ...survey, vibes: toggle<VibeTag>(survey.vibes, t) })}
                    className={`rounded-full border px-5 py-2.5 text-base lowercase transition-colors ${survey.vibes.includes(t) ? 'border-paper bg-paper text-ink' : 'border-paper/30 hover:border-paper'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {step === 5 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CATEGORIES.map((c) => {
                  const on = survey.needs.includes(c.slug)
                  return (
                    <button
                      key={c.slug}
                      onClick={() => setSurvey({ ...survey, needs: toggle<CategorySlug>(survey.needs, c.slug) })}
                      className={`relative aspect-[4/3] overflow-hidden rounded-2xl border text-left transition-colors ${on ? 'border-paper' : 'border-transparent'}`}
                    >
                      <img src={c.image} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity ${on ? 'opacity-90' : 'opacity-40'}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <span className="text-lg font-bold lowercase leading-tight">{c.name}</span>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${on ? 'border-paper bg-paper text-ink' : 'border-paper/50'}`}>
                          {on && <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 8.5l3 3 7-7" /></svg>}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-paper/15 pt-6">
          <button className="label-caps text-paper/60 hover:text-paper disabled:opacity-0" disabled={step === 1} onClick={() => setStep(step - 1)}>← back</button>
          <button className="pill-light" disabled={!canNext} onClick={next}>
            {step === TOTAL ? 'see my vendors' : 'continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
