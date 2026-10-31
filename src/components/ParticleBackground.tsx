import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { ParticleField } from '../particles/ParticleField'
import { shapes } from '../particles/shapes'

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<ParticleField | null>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [supported, setSupported] = useState(true)
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let field: ParticleField | null = null
    let cancelled = false
    // wait for fonts so the "404" glyph samples with the intended typeface
    const start = () => {
      if (cancelled) return
      try {
        field = new ParticleField({ canvas, onShape: setActive, reducedMotion: reduced })
        fieldRef.current = field
      } catch {
        setSupported(false)
      }
    }
    const fonts = document.fonts?.load('700 118px "JetBrains Mono"').catch(() => undefined)
    if (fonts) fonts.then(start)
    else start()
    return () => {
      cancelled = true
      field?.dispose()
      fieldRef.current = null
    }
  }, [reduced])

  useEffect(() => {
    fieldRef.current?.setPaused(paused)
  }, [paused])

  if (!supported) return null
  const shape = shapes[active]

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-screen w-screen"
      />
      <div className="fixed bottom-4 left-4 z-30 flex max-w-[calc(100vw-2rem)] items-center gap-3 border border-dim bg-bg px-3.5 py-2.5 font-mono">
        {!reduced && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Resume particle animation' : 'Pause particle animation'}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-dim text-ink transition-colors hover:text-accent"
          >
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>
        )}
        <div className="min-w-0" aria-live="off">
          <p className="text-xs tracking-wide text-dim uppercase"># background · error signature</p>
          <p className="truncate text-sm text-ink">
            <span className="text-accent">{shape.code}</span>
            <span className="hidden text-dim sm:inline"> — {shape.label}</span>
          </p>
        </div>
        <div className="ml-1 hidden items-center gap-1 sm:flex" role="group" aria-label="Choose error signature">
          {shapes.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => fieldRef.current?.goTo(i)}
              aria-label={`Show ${s.code}`}
              aria-current={i === active}
              className="flex h-6 w-3 items-center justify-center"
            >
              <span className={`block h-1.5 w-1.5 transition-colors ${i === active ? 'bg-accent' : 'bg-dim hover:bg-ink'}`} />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
