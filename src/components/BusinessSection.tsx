import Reveal from './Reveal'
import { Rule } from './Sections'

/* ------------------------------------------------------------------ business */

const solved = [
  {
    index: '01',
    title: "Detect the unexpected",
    line: "Learns what's normal for each host and service, instead of relying on fixed thresholds.",
  },
  {
    index: '02',
    title: "Understand, don't just alert",
    line: 'Every incident links to the exact events that support it.',
  },
  {
    index: '03',
    title: "See what's connected",
    line: 'Groups related failures using trace IDs and dependencies, and keeps unrelated ones separate.',
  },
]

const comparison = [
  { aspect: 'Detection', traditional: 'static thresholds', ours: 'per-host learned baselines' },
  { aspect: 'Alerts', traditional: 'a number and a timestamp', ours: 'observed vs. baseline plus evidence' },
  { aspect: 'Correlation', traditional: 'time proximity', ours: 'trace, dependency, and host/service evidence' },
  { aspect: 'Uncertainty', traditional: 'hidden', ours: 'shown; "Unknown" is a valid answer' },
  { aspect: 'Data handling', traditional: 'often raw logs', ours: 'redacted at the source' },
  { aspect: 'Actions', traditional: 'some auto-remediate', ours: 'read-only suggestions only' },
  { aspect: 'Cost', traditional: 'always-on servers', ours: 'serverless, pay per use' },
]

const trust = [
  { keyword: 'transparent', line: 'no black-box LLM in detection' },
  { keyword: 'private', line: 'secrets redacted before leaving the host' },
  { keyword: 'safe', line: "collectors can't read incidents" },
]

export default function BusinessSection() {
  return (
    <section id="business" className="px-5 py-16 md:py-24">
      <Rule />
      <div className="mx-auto max-w-6xl mt-16 md:mt-24">
        <Reveal>
          <p className="font-mono text-xl text-accent sm:text-2xl">$ cat business.md</p>
          <h2 className="mt-4 max-w-2xl font-mono text-2xl font-medium text-ink sm:text-3xl md:text-4xl">
            Logs tell you something broke. We tell you why.
          </h2>
          <p className="mt-4 max-w-xl font-mono text-base text-dim sm:text-lg">
            Evidence-backed anomaly detection for DevOps teams.
          </p>
        </Reveal>

        <div className="mt-12 md:mt-16">
          <Reveal>
            <h3 className="font-mono text-lg text-ink sm:text-xl"># what we solve</h3>
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5">
            {solved.map((s) => (
              <Reveal key={s.index} className="h-full">
                <div className="h-full border border-dim p-5 font-mono md:p-6">
                  <p className="text-sm text-dim"># {s.index}</p>
                  <p className="mt-2 text-lg font-medium text-ink">{s.title}</p>
                  <p className="mt-2 text-base leading-relaxed text-dim">{s.line}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-12 md:mt-16">
          <Reveal>
            <h3 className="font-mono text-lg text-ink sm:text-xl"># why we&apos;re different</h3>
          </Reveal>
          <Reveal className="mt-6">
            <div className="overflow-x-auto border border-dim">
              <table className="w-full min-w-[44rem] border-collapse text-left font-mono text-sm sm:text-base">
                <caption className="sr-only">
                  Traditional monitoring compared with our system
                </caption>
                <thead>
                  <tr className="border-b border-dim">
                    <th scope="col" className="px-4 py-3 font-medium text-dim">
                      # aspect
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-dim">
                      Traditional monitoring
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-accent">
                      Our system
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.aspect} className="border-b border-dim align-top last:border-b-0">
                      <th scope="row" className="px-4 py-3 font-medium whitespace-nowrap text-ink">
                        {row.aspect}
                      </th>
                      <td className="px-4 py-3 text-dim">{row.traditional}</td>
                      <td className="px-4 py-3 text-ink">{row.ours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-10 grid gap-4 border-t border-dim pt-8 font-mono text-sm sm:grid-cols-3 sm:text-base">
            {trust.map((t) => (
              <p key={t.keyword} className="text-dim">
                <span className="font-semibold text-accent">{t.keyword}</span> — {t.line}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
