import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Reveal from './Reveal'

/* ------------------------------------------------------------------ typing effect (hero only) */

function TypedCommand({ text, onDone }: { text: string; onDone: () => void }) {
  const [len, setLen] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (len < text.length) {
      const id = setTimeout(() => setLen((l) => l + 1), 45 + Math.random() * 35)
      return () => clearTimeout(id)
    }
    setDone(true)
    onDone()
  }, [len, text, onDone])

  return (
    <span className="font-mono text-xl text-ink sm:text-2xl md:text-3xl">
      <span className="text-accent">$ </span>
      {text.slice(0, len)}
      {!done && <span className="cursor-blink inline-block w-[0.6em] h-[1.1em] bg-ink align-middle ml-px" />}
    </span>
  )
}

/* ------------------------------------------------------------------ hero */

export function Hero() {
  const [typed, setTyped] = useState(false)

  return (
    <section className="px-5 pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-6">
            <TypedCommand text="lad --detect --explain" onDone={() => setTyped(true)} />
          </div>
          <div className={typed ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}>
            <h1 className="max-w-2xl font-mono text-3xl leading-[1.15] font-medium text-ink sm:text-5xl md:text-6xl">
              Unusual logs, explained with evidence.
            </h1>
            <p className="mt-5 max-w-xl font-mono text-lg leading-relaxed text-dim sm:text-xl">
              # a read-only pipeline from host logs to an incident you can check
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center border border-accent bg-accent px-6 font-mono text-base font-medium text-on-accent transition-colors duration-150 hover:bg-accent-hover"
              >
                [ log in ]
              </Link>
              <a
                href="#how"
                className="inline-flex h-12 items-center justify-center border border-dim px-6 font-mono text-base text-ink transition-colors duration-150 hover:text-accent"
              >
                $ lad --how-it-works
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ section rule */

function Rule() {
  return <hr className="border-t border-dim mx-auto max-w-6xl" />
}

/* ------------------------------------------------------------------ problem */

const problems = [
  {
    index: '01',
    title: 'Fixed rules only catch what someone already imagined.',
    body: 'A rule like "5xx > 100" cannot express "unusual for this host at this hour".',
  },
  {
    index: '02',
    title: 'Raw alerts have no context.',
    body: 'A DB timeout and an HTTP 500 spike that share a trace are one incident. Two unrelated outages in the same minute are two.',
  },
]

export function Problem() {
  return (
    <section id="problem" className="px-5 py-16 md:py-24">
      <Rule />
      <div className="mx-auto max-w-6xl mt-16 md:mt-24">
        <Reveal>
          <h2 className="font-mono text-xl text-accent sm:text-2xl">$ cat problem.txt</h2>
        </Reveal>
        <div className="mt-8 space-y-8">
          {problems.map((p) => (
            <Reveal key={p.index}>
              <div className="font-mono">
                <p className="text-dim text-base"># {p.index}</p>
                <p className="mt-2 text-ink text-lg font-medium sm:text-xl">&gt; {p.title}</p>
                <p className="mt-2 text-dim text-base leading-relaxed sm:text-lg">&gt; {p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ why it matters (removed as section — folded into flow) */

export function WhyItMatters() {
  return null
}

/* ------------------------------------------------------------------ pipeline */

const steps = [
  { title: 'collect', line: 'Pull logs from Linux, Windows, and application sources.' },
  { title: 'normalize', line: 'Parse and standardize fields across all log formats.' },
  { title: 'detect', line: 'Compare against statistical baselines per host and time window.' },
  { title: 'correlate', line: 'Group related anomalies into single incidents using shared evidence.' },
  { title: 'explain', line: 'Show exactly which events support or contradict each incident.' },
]

export function HowItWorks() {
  return (
    <section id="how" className="px-5 py-16 md:py-24">
      <Rule />
      <div className="mx-auto max-w-6xl mt-16 md:mt-24">
        <Reveal>
          <h2 className="font-mono text-xl text-accent sm:text-2xl">$ ./pipeline --explain</h2>
        </Reveal>
        <Reveal className="mt-8">
          <div className="flex flex-wrap items-start gap-5 font-mono">
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-start gap-4">
                <div>
                  <span className="inline-block border border-dim px-3.5 py-1.5 text-base font-medium text-ink sm:text-lg">
                    {s.title}
                  </span>
                  <p className="mt-2 text-sm text-dim leading-relaxed max-w-[12rem] sm:text-base sm:max-w-[13rem]"># {s.line}</p>
                </div>
                {i < steps.length - 1 && (
                  <span className="text-dim mt-2 text-lg sm:text-xl select-none">|</span>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ principles */

const principles = [
  { keyword: 'transparent', line: 'Statistical baselines you can recompute by hand, no black box.' },
  { keyword: 'evidence-backed', line: 'Every incident links to the events that support it, contradict it, and the evidence still missing.' },
  { keyword: 'honest', line: '"Unknown" is a valid answer. Anomaly score is not a probability.' },
  { keyword: 'read-only', line: 'Suggests diagnostic checks, never runs remediation.' },
  { keyword: 'private', line: 'Sensitive data is redacted before leaving the host.' },
  { keyword: 'local-first', line: 'Runs locally with no cloud account, or on AWS.' },
]

const nots = ['# no auto-remediation', '# no root cause claimed from timing alone', '# no LLM in the detection path']

export function Principles() {
  return (
    <section id="principles" className="px-5 py-16 md:py-24">
      <Rule />
      <div className="mx-auto max-w-6xl mt-16 md:mt-24">
        <Reveal>
          <h2 className="font-mono text-xl text-accent sm:text-2xl">$ cat principles.md</h2>
        </Reveal>
        <div className="mt-8 space-y-4 font-mono">
          {principles.map((p) => (
            <Reveal key={p.keyword}>
              <p className="text-base leading-relaxed sm:text-lg">
                <span className="text-accent font-semibold">{p.keyword}</span>
                <span className="text-dim"> — {p.line}</span>
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-8 space-y-2 font-mono">
            {nots.map((n) => (
              <p key={n} className="text-base text-dim sm:text-lg">{n}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ not doing (folded into principles) */

export function NotDoing() {
  return null
}

/* ------------------------------------------------------------------ final cta */

export function FinalCta() {
  return (
    <section className="px-5 py-16 md:py-24">
      <Rule />
      <div className="mx-auto max-w-6xl mt-16 md:mt-24 flex justify-end">
        <Reveal className="text-right">
          <p className="font-mono text-xl text-accent sm:text-2xl">$ lad --start</p>
          <p className="mt-4 font-mono text-2xl font-medium text-ink sm:text-3xl">Ready to see an incident?</p>
          <div className="mt-8 flex justify-end">
            <Link
              to="/login"
              className="inline-flex h-12 items-center justify-center border border-accent bg-accent px-6 font-mono text-base font-medium text-on-accent transition-colors duration-150 hover:bg-accent-hover"
            >
              [ log in ]
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ footer */

export function Footer() {
  return (
    <footer className="border-t border-dim px-5 py-10 pb-24 sm:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 font-mono text-base sm:flex-row sm:items-start sm:justify-between">
        <p className="text-dim"># Automated Log Anomaly Detector</p>
        <div className="flex flex-col gap-1 text-dim">
          <p># hackathon project</p>
        </div>
      </div>
    </footer>
  )
}
