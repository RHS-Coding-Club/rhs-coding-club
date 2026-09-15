import { useEffect, useRef } from 'react'
import { cn } from '#/lib/utils'

/**
 * The home hero background: the club's navy-to-sky poster gradient drawn by
 * a small WebGL fragment shader with slow domain-warped flow and film grain,
 * plus a 2D canvas of drifting 0s and 1s (the logo's droplet digits).
 *
 * Server-rendered as an empty box over the CSS gradient fallback; the shader
 * fades in once it has drawn a frame. Reduced motion renders a single still
 * frame. Offscreen or hidden tabs pause the loop.
 */
export function HeroCanvas({ className }: { className?: string }) {
  const glRef = useRef<HTMLCanvasElement>(null)
  const digitsRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const glCanvas = glRef.current
    const digitsCanvas = digitsRef.current
    if (!glCanvas || !digitsCanvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const gl = glCanvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      powerPreference: 'low-power',
    })
    const program = gl ? buildProgram(gl) : null
    const ctx2d = digitsCanvas.getContext('2d')

    let width = 0
    let height = 0
    let raf = 0
    let running = false
    let visible = true
    const start = performance.now()

    const digits = Array.from({ length: 42 }, (_, i) => makeDigit(i))

    function resize() {
      const rect = glCanvas!.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      for (const c of [glCanvas!, digitsCanvas!]) {
        c.width = Math.floor(width * dpr)
        c.height = Math.floor(height * dpr)
      }
      if (gl) gl.viewport(0, 0, glCanvas!.width, glCanvas!.height)
    }

    function drawGl(t: number) {
      if (!gl || !program) return
      gl.useProgram(program.program)
      gl.uniform2f(program.uRes, glCanvas!.width, glCanvas!.height)
      gl.uniform1f(program.uTime, t)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    function drawDigits(dt: number) {
      if (!ctx2d) return
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx2d.clearRect(0, 0, width, height)
      ctx2d.font = '500 13px "JetBrains Mono", ui-monospace, monospace'
      ctx2d.textBaseline = 'middle'
      ctx2d.textAlign = 'center'
      for (const d of digits) {
        d.y += d.speed * dt
        d.x += Math.sin((d.y + d.phase) * 0.01) * 0.15
        if (d.y > height + 20) {
          d.y = -20
          d.x = Math.random() * width
        }
        ctx2d.globalAlpha = d.alpha
        ctx2d.fillStyle = '#e6edf5'
        ctx2d.fillText(d.char, d.x, d.y)
      }
      ctx2d.globalAlpha = 1
    }

    let last = start
    function frame(now: number) {
      const t = (now - start) / 1000
      const dt = Math.min((now - last) / 16.67, 3)
      last = now
      drawGl(t)
      drawDigits(dt)
      if (running && !reduceMotion) raf = requestAnimationFrame(frame)
    }

    function play() {
      if (running || !visible || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    function pause() {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()
    // Scatter digits across the box before the first frame so nothing "pops in".
    for (const d of digits) {
      d.x = Math.random() * width
      d.y = Math.random() * height
    }
    frame(performance.now())
    glCanvas.style.opacity = '1'
    digitsCanvas.style.opacity = '1'
    if (!reduceMotion) play()

    const ro = new ResizeObserver(() => {
      resize()
      if (reduceMotion) frame(performance.now())
    })
    ro.observe(glCanvas)

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting)
      if (visible) play()
      else pause()
    })
    io.observe(glCanvas)

    const onVisibility = () => (document.hidden ? pause() : play())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      pause()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      if (gl && program) gl.deleteProgram(program.program)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      <canvas
        ref={glRef}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
      />
      <canvas
        ref={digitsRef}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
      />
    </div>
  )
}

interface Digit {
  char: '0' | '1'
  x: number
  y: number
  speed: number
  alpha: number
  phase: number
}

function makeDigit(i: number): Digit {
  return {
    char: i % 3 === 0 ? '1' : '0',
    x: 0,
    y: 0,
    speed: 0.25 + Math.random() * 0.45,
    alpha: 0.12 + Math.random() * 0.28,
    phase: Math.random() * 1000,
  }
}

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

// Poster gradient: deep navy at the top, sky blue at the bottom, warped by
// slow fractal noise, with a hint of the near-black ground in the top-left
// and fine grain everywhere so it reads as printed rather than flat.
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec2(17.3, 9.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = u_time * 0.045;

  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t * 0.6 + 4.2));
  float w = fbm(p * 1.8 + 1.6 * q + t * 0.25);

  // 0 at top-left, 1 at bottom-right, bent by the warp.
  float g = (1.0 - uv.y) * 0.72 + uv.x * 0.28 + (w - 0.5) * 0.42;
  g = clamp(g, 0.0, 1.0);

  vec3 ground = vec3(0.043, 0.059, 0.082);
  vec3 navy   = vec3(0.122, 0.310, 0.541);
  vec3 sky    = vec3(0.373, 0.698, 0.933);
  vec3 frost  = vec3(0.902, 0.929, 0.961);

  vec3 col = mix(navy, sky, smoothstep(0.18, 0.95, g));
  col = mix(ground, col, smoothstep(0.0, 0.32, g + 0.06));
  col = mix(col, frost, smoothstep(0.93, 1.25, g) * 0.35);

  float grain = fract(sin(dot(gl_FragCoord.xy + vec2(u_time * 37.0), vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.045;

  gl_FragColor = vec4(col, 1.0);
}
`

function buildProgram(gl: WebGLRenderingContext) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)
    if (!s) return null
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s)
      return null
    }
    return s
  }
  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG)
  const program = gl.createProgram()
  if (!vs || !fs) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null

  // One oversized triangle covers the viewport.
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  return {
    program,
    uRes: gl.getUniformLocation(program, 'u_res'),
    uTime: gl.getUniformLocation(program, 'u_time'),
  }
}
