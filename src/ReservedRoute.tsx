import { Link } from 'react-router-dom'

export default function ReservedRoute({ title, note }: { title: string; note: string }) {
  return (
    <main className="flex min-h-screen items-center px-5 py-16 text-ink">
      <div className="mx-auto w-full max-w-lg border border-dim bg-bg p-8">
        <p className="font-mono text-sm tracking-wide text-dim uppercase"># placeholder</p>
        <h1 className="mt-3 font-mono text-3xl font-medium tracking-tight">{title}</h1>
        <p className="mt-4 font-mono text-base leading-relaxed text-dim sm:text-lg">{note}</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center font-mono text-base text-accent underline decoration-dim underline-offset-4 hover:decoration-accent"
        >
          $ cd /
        </Link>
      </div>
    </main>
  )
}
