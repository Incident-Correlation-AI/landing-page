export interface ErrorShape {
  id: string
  code: string
  label: string
  draw: (ctx: CanvasRenderingContext2D) => void
}

const S = 256

function base(ctx: CanvasRenderingContext2D, lw = 16) {
  ctx.clearRect(0, 0, S, S)
  ctx.strokeStyle = '#fff'
  ctx.fillStyle = '#fff'
  ctx.lineWidth = lw
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalCompositeOperation = 'source-over'
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

export const shapes: ErrorShape[] = [
  {
    id: 'http500',
    code: 'HTTP 500',
    label: 'Internal server error',
    draw(ctx) {
      base(ctx, 14)
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.roundRect(44, 34 + i * 64, 168, 50, 10)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(76, 59 + i * 64, 7, 0, Math.PI * 2)
        ctx.fill()
        line(ctx, 112, 59 + i * 64, 178, 59 + i * 64)
      }
    },
  },
  {
    id: 'warn',
    code: 'WARN',
    label: 'Threshold exceeded',
    draw(ctx) {
      base(ctx, 18)
      ctx.beginPath()
      ctx.moveTo(128, 32)
      ctx.lineTo(228, 210)
      ctx.lineTo(28, 210)
      ctx.closePath()
      ctx.stroke()
      line(ctx, 128, 98, 128, 150)
      ctx.beginPath()
      ctx.arc(128, 179, 10, 0, Math.PI * 2)
      ctx.fill()
    },
  },
  {
    id: 'exception',
    code: 'EXCEPTION',
    label: 'Unhandled bug',
    draw(ctx) {
      base(ctx, 11)
      ctx.beginPath()
      ctx.ellipse(128, 154, 42, 58, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(128, 86, 24, 0, Math.PI * 2)
      ctx.fill()
      for (const m of [1, -1]) {
        const x = (v: number) => 128 + m * v
        line(ctx, x(38), 124, x(84), 98)
        line(ctx, x(42), 154, x(92), 154)
        line(ctx, x(38), 186, x(80), 218)
        line(ctx, x(10), 68, x(26), 38)
      }
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 6
      line(ctx, 128, 112, 128, 206)
    },
  },
  {
    id: 'fatal',
    code: 'FATAL',
    label: 'Process crashed',
    draw(ctx) {
      base(ctx, 16)
      ctx.beginPath()
      ctx.arc(128, 128, 90, 0, Math.PI * 2)
      ctx.stroke()
      ctx.lineWidth = 20
      line(ctx, 92, 92, 164, 164)
      line(ctx, 164, 92, 92, 164)
    },
  },
  {
    id: 'db',
    code: 'DB POOL',
    label: 'Connections exhausted',
    draw(ctx) {
      base(ctx, 15)
      ctx.beginPath()
      ctx.ellipse(128, 62, 80, 26, 0, 0, Math.PI * 2)
      ctx.stroke()
      line(ctx, 48, 62, 48, 194)
      line(ctx, 208, 62, 208, 194)
      for (const y of [128, 194]) {
        ctx.beginPath()
        ctx.ellipse(128, y, 80, 26, 0, 0, Math.PI)
        ctx.stroke()
      }
    },
  },
  {
    id: 'forbidden',
    code: 'HTTP 403',
    label: 'Forbidden',
    draw(ctx) {
      base(ctx, 18)
      ctx.beginPath()
      ctx.arc(128, 104, 48, Math.PI, 0)
      ctx.stroke()
      line(ctx, 80, 104, 80, 124)
      line(ctx, 176, 104, 176, 124)
      ctx.beginPath()
      ctx.roundRect(50, 116, 156, 114, 18)
      ctx.fill()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(128, 160, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(122, 160, 12, 36)
    },
  },
  {
    id: 'oom',
    code: 'OOM KILL',
    label: 'Out of memory',
    draw(ctx) {
      base(ctx, 13)
      ctx.beginPath()
      ctx.roundRect(70, 70, 116, 116, 12)
      ctx.stroke()
      ctx.fillRect(104, 104, 48, 48)
      for (const p of [102, 128, 154]) {
        line(ctx, p, 70, p, 32)
        line(ctx, p, 186, p, 224)
        line(ctx, 70, p, 32, p)
        line(ctx, 186, p, 224, p)
      }
    },
  },
  {
    id: '404',
    code: 'HTTP 404',
    label: 'Not found',
    draw(ctx) {
      base(ctx)
      ctx.font = '700 118px "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('404', 128, 134)
    },
  },
  {
    id: 'timeout',
    code: 'TIMEOUT',
    label: 'Upstream deadline exceeded',
    draw(ctx) {
      base(ctx, 16)
      ctx.beginPath()
      ctx.arc(128, 134, 88, 0, Math.PI * 2)
      ctx.stroke()
      line(ctx, 128, 134, 128, 78)
      line(ctx, 128, 134, 170, 156)
      line(ctx, 106, 28, 150, 28)
    },
  },
]

/** Rasterise a shape and return `count` points in a [-0.5, 0.5] square, plus a depth value. */
export function sampleShape(shape: ErrorShape, count: number, extent: number, depth: number): Float32Array {
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  shape.draw(ctx)
  const data = ctx.getImageData(0, 0, S, S).data
  const px: number[] = []
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (data[(y * S + x) * 4 + 3] > 128) px.push(x, y)
    }
  }
  const total = px.length / 2
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const k = Math.floor(Math.random() * total) * 2
    const x = px[k] + Math.random()
    const y = px[k + 1] + Math.random()
    out[i * 3] = ((x - S / 2) / S) * extent
    out[i * 3 + 1] = (-(y - S / 2) / S) * extent
    out[i * 3 + 2] = (Math.random() - 0.5) * depth
  }
  return out
}
