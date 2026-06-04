'use client'
import { useEffect, useRef } from 'react'

export default function StarfieldCanvas({ opacity = 0.6 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    const CY: [number, number, number] = [75, 225, 236]
    const VI: [number, number, number] = [203, 94, 238]
    const LINK = 132

    let W = 0, H = 0, raf = 0
    let mouse = { x: -9999, y: -9999 }

    type Node = {
      x: number; y: number; vx: number; vy: number
      r: number; c: [number, number, number]; tw: number
    }
    let nodes: Node[] = []

    function build() {
      const count = Math.round(Math.min(80, Math.max(30, (W * H) / 21000)))
      nodes = []
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.5 + 0.5,
          c: Math.random() > 0.5 ? CY : VI,
          tw: Math.random() * Math.PI * 2,
        })
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      W = rect.width; H = rect.height
      canvas!.width = W * DPR; canvas!.height = H * DPR
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
      build()
    }

    function lerp(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
    }

    function frame() {
      ctx!.clearRect(0, 0, W, H)

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.tw += 0.018
        if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20
        if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20
        const mdx = n.x - mouse.x, mdy = n.y - mouse.y
        const md = Math.hypot(mdx, mdy)
        if (md < 150) { n.x += (mdx / md) * 0.4; n.y += (mdy / md) * 0.4 }
      }

      // connection lines
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const p = nodes[a], q = nodes[b]
          const dx = p.x - q.x, dy = p.y - q.y
          const d = Math.hypot(dx, dy)
          if (d < LINK) {
            const t = 1 - d / LINK
            const col = lerp(p.c, q.c, 0.5)
            ctx!.strokeStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${t * 0.16})`
            ctx!.lineWidth = t
            ctx!.beginPath(); ctx!.moveTo(p.x, p.y); ctx!.lineTo(q.x, q.y); ctx!.stroke()
          }
        }
      }

      // star dots
      for (const m of nodes) {
        const glow = 0.5 + Math.sin(m.tw) * 0.35
        ctx!.beginPath()
        ctx!.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${0.4 + glow * 0.3})`
        ctx!.shadowBlur = 6
        ctx!.shadowColor = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},0.7)`
        ctx!.fill()
        ctx!.shadowBlur = 0
      }

      raf = requestAnimationFrame(frame)
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    resize()

    if (reduce) {
      // single static frame, no loop
      frame()
      cancelAnimationFrame(raf)
      return
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame) }
        else { cancelAnimationFrame(raf); raf = 0 }
      })
    }, { threshold: 0 })
    obs.observe(canvas)

    const onMove = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    window.addEventListener('pointermove', onMove)

    let rt = 0
    const onResize = () => { clearTimeout(rt); rt = window.setTimeout(resize, 200) }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      obs.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity, pointerEvents: 'none' }}
    />
  )
}
