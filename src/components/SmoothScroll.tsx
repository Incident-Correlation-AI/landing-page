import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/* Fixed window chrome (2rem) + navbar (4rem) — keeps anchor targets below the header. */
const HEADER_OFFSET = -96

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: HEADER_OFFSET },
      /* Default is 0.1; a lower lerp gives a longer, softer glide. */
      lerp: 0.07,
    })
    return () => lenis.destroy()
  }, [])

  return null
}
