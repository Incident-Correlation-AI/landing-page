import * as THREE from 'three'
import { shapes, sampleShape } from './shapes'

const vertex = /* glsl */ `
  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uMouse;
  uniform float uMouseOn;
  attribute vec3 aTarget;
  attribute vec4 aRand;
  varying float vGlow;
  varying float vTone;

  void main() {
    float t = clamp((uMix - aRand.x * 0.45) / 0.55, 0.0, 1.0);
    float e = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(position, aTarget, e);

    // turbulent burst while particles travel between two shapes
    float travel = sin(3.14159265 * e);
    float a = aRand.y * 6.2831853 + uTime * 0.9;
    vec3 swirl = vec3(cos(a), sin(a * 1.3), sin(a * 0.7 + aRand.z * 6.0));
    p += swirl * travel * (0.5 + aRand.z * 1.4);

    // idle shimmer
    p += 0.035 * vec3(
      sin(uTime * 1.3 + aRand.y * 40.0),
      cos(uTime * 1.1 + aRand.z * 40.0),
      sin(uTime * 0.9 + aRand.w * 40.0)
    );

    vec4 world = modelMatrix * vec4(p, 1.0);

    // pointer repulsion
    vec3 d = world.xyz - uMouse;
    float dist = length(d.xy);
    float push = uMouseOn * smoothstep(1.7, 0.0, dist);
    world.xyz += normalize(vec3(d.xy, 0.35 + dist * 0.2)) * push * 0.75;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand.w * 0.9 + travel * 0.5) * (7.0 / -mv.z);
    vGlow = travel;
    vTone = aRand.w;
  }
`

const fragment = /* glsl */ `
  uniform vec3 uAmber;
  uniform vec3 uInk;
  uniform vec3 uRed;
  uniform float uOpacity;
  varying float vGlow;
  varying float vTone;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.0, r);
    vec3 col = vTone < 0.68 ? uAmber : (vTone < 0.9 ? uInk : uRed);
    col = mix(col, uRed, vGlow * 0.55);
    float alpha = core * core * (0.55 + vGlow * 0.5) * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`

export interface FieldOptions {
  canvas: HTMLCanvasElement
  onShape?: (index: number) => void
  reducedMotion: boolean
}

export class ParticleField {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60)
  private group = new THREE.Group()
  private geometry = new THREE.BufferGeometry()
  private material: THREE.ShaderMaterial
  private dust: THREE.Points
  private count: number
  private samples: Float32Array[] = []
  private current = 0
  private next = 1
  private mixValue = 0
  private state: 'hold' | 'morph' = 'hold'
  private stateStart = 0
  private paused = false
  private raf = 0
  private clock = new THREE.Clock()
  private mouse = new THREE.Vector2(0, 0)
  private mouseTarget = new THREE.Vector2(0, 0)
  private mouseWorld = new THREE.Vector3(99, 99, 0)
  private mouseOn = 0
  private mouseOnTarget = 0
  private scrollY = 0
  private smoothScroll = 0
  private offsetX = 0
  private viewport = { w: 1, h: 1 }
  private readonly holdTime = 3.6
  private readonly morphTime = 2.2
  private elapsed = 0
  private opts: FieldOptions
  private ray = new THREE.Raycaster()
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

  constructor(opts: FieldOptions) {
    this.opts = opts
    const small = window.innerWidth < 720
    this.count = small ? 5500 : 11000
    this.renderer = new THREE.WebGLRenderer({ canvas: opts.canvas, alpha: true, antialias: false, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.camera.position.set(0, 0, 8.5)

    const extent = 5.2
    this.samples = shapes.map((s) => sampleShape(s, this.count, extent, 0.9))

    const pos = new Float32Array(this.samples[0])
    const target = new Float32Array(this.samples[1])
    const rand = new Float32Array(this.count * 4)
    for (let i = 0; i < rand.length; i++) rand[i] = Math.random()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.geometry.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
    this.geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))

    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uMix: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 5.2 },
        uPixelRatio: { value: 1 },
        uMouse: { value: this.mouseWorld },
        uMouseOn: { value: 0 },
        uAmber: { value: new THREE.Color('#e4a15a') },
        uInk: { value: new THREE.Color('#9fb4c8') },
        uRed: { value: new THREE.Color('#ee6a52') },
        uOpacity: { value: 0.9 },
      },
    })
    const points = new THREE.Points(this.geometry, this.material)
    points.frustumCulled = false
    this.group.add(points)

    // distant dust for parallax depth
    const dustCount = small ? 250 : 600
    const dp = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount; i++) {
      dp[i * 3] = (Math.random() - 0.5) * 26
      dp[i * 3 + 1] = (Math.random() - 0.5) * 16
      dp[i * 3 + 2] = -Math.random() * 14 - 1
    }
    const dg = new THREE.BufferGeometry()
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3))
    this.dust = new THREE.Points(
      dg,
      new THREE.PointsMaterial({ color: 0x5c6c7c, size: 0.045, transparent: true, opacity: 0.55, depthWrite: false }),
    )
    this.scene.add(this.dust)
    this.scene.add(this.group)

    this.resize()
    window.addEventListener('resize', this.resize)
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    window.addEventListener('pointerleave', this.onLeave)
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.onScroll()
    this.opts.onShape?.(0)
    this.loop()
  }

  private onPointer = (e: PointerEvent) => {
    this.mouseTarget.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    this.mouseOnTarget = 1
  }
  private onLeave = () => {
    this.mouseOnTarget = 0
  }
  private onScroll = () => {
    this.scrollY = window.scrollY
  }

  private resize = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    this.viewport = { w, h }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2)
    const aspect = w / h
    const scale = w < 720 ? 0.78 : Math.min(1.15, Math.max(0.8, aspect * 0.62))
    this.group.scale.setScalar(scale)
    this.offsetX = w >= 1024 ? 2.35 : (w >= 720 ? 1.4 : 0.7)
  }

  setPaused(p: boolean) {
    this.paused = p
  }

  /** Jump straight to a specific shape (used by the HUD dots). */
  goTo(index: number) {
    if (index === this.current && this.state === 'hold') return
    this.snapToCurrent()
    this.next = index
    this.beginMorph()
  }

  private snapToCurrent() {
    if (this.state === 'morph') {
      this.finishMorph()
    }
  }

  private beginMorph() {
    const target = this.geometry.getAttribute('aTarget') as THREE.BufferAttribute
    ;(target.array as Float32Array).set(this.samples[this.next])
    target.needsUpdate = true
    this.state = 'morph'
    this.stateStart = this.elapsed
    this.opts.onShape?.(this.next)
  }

  private finishMorph() {
    const pos = this.geometry.getAttribute('position') as THREE.BufferAttribute
    ;(pos.array as Float32Array).set(this.samples[this.next])
    pos.needsUpdate = true
    this.current = this.next
    this.mixValue = 0
    this.state = 'hold'
    this.stateStart = this.elapsed
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    const dt = Math.min(this.clock.getDelta(), 0.05)
    const time = this.clock.elapsedTime
    const reduced = this.opts.reducedMotion
    if (!this.paused && !reduced) this.elapsed += dt

    // morph state machine
    if (!this.paused && !reduced) {
      if (this.state === 'hold' && this.elapsed - this.stateStart > this.holdTime) {
        this.next = (this.current + 1) % shapes.length
        this.beginMorph()
      } else if (this.state === 'morph') {
        const p = Math.min((this.elapsed - this.stateStart) / this.morphTime, 1)
        this.mixValue = p
        if (p >= 1) this.finishMorph()
      }
    }

    // inputs
    this.mouse.lerp(this.mouseTarget, 0.06)
    this.mouseOn += (this.mouseOnTarget - this.mouseOn) * 0.08
    this.smoothScroll += (this.scrollY - this.smoothScroll) * 0.08

    const scrollT = this.smoothScroll / Math.max(1, document.documentElement.scrollHeight - this.viewport.h)
    const spin = reduced ? 0 : this.elapsed
    this.group.rotation.y = Math.sin(spin * 0.35) * 0.55 + this.mouse.x * 0.25 + scrollT * Math.PI * 1.2
    this.group.rotation.x = -this.mouse.y * 0.18 + Math.sin(spin * 0.27) * 0.08 + scrollT * 0.25
    // Vertically centered at all times so nothing is cut off
    this.group.position.y = 0
    this.dust.position.y = 0

    // Hero section (top): particles on the right (this.offsetX)
    // Middle sections: centered (x = 0)
    // Last section (end): moves to the left (-this.offsetX)
    const heroProgress = Math.min(1, scrollT / 0.28)
    const heroEase = heroProgress * heroProgress * (3 - 2 * heroProgress)
    const fromRight = this.offsetX * (1 - heroEase)

    const endProgress = Math.max(0, Math.min(1, (scrollT - 0.58) / 0.42))
    const endEase = endProgress * endProgress * (3 - 2 * endProgress)
    const toLeft = -this.offsetX * endEase

    this.group.position.x = fromRight + toLeft
    this.dust.rotation.y = time * 0.01 + this.mouse.x * 0.03

    // pointer on z=0 plane for repulsion
    this.ray.setFromCamera(this.mouse, this.camera)
    this.ray.ray.intersectPlane(this.plane, this.mouseWorld)

    const u = this.material.uniforms
    u.uMix.value = this.mixValue
    u.uTime.value = time
    u.uMouseOn.value = reduced ? 0 : this.mouseOn
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('pointermove', this.onPointer)
    window.removeEventListener('pointerleave', this.onLeave)
    window.removeEventListener('scroll', this.onScroll)
    this.geometry.dispose()
    this.material.dispose()
    this.dust.geometry.dispose()
    ;(this.dust.material as THREE.Material).dispose()
    this.renderer.dispose()
  }
}
