"use client"

import { useEffect, useRef } from "react"

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // alpha:false -> opaque, faster compositing; desynchronized:true -> lower latency
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true } as any) as CanvasRenderingContext2D | null
    if (!ctx) return

    // respect reduced motion: static fallback
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (prefersReduced.matches) {
      canvas.style.opacity = "0.14"
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = "#030a04"
      ctx.fillRect(0, 0, w, h)
      return
    }

    let animationId = 0
    let width = 0
    let height = 0
    let columns = 0
    // leicht größere Schrift = weniger Spalten = weniger Draw Calls
    const fontSize = 15
    const chars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$+-*/=%\"#&_(),.;:?!\\|{}<>[]^~"
    const charArray = chars.split("")

    let drops: number[] = []
    let speeds: number[] = []

    // debounce resize - avoid thrashing
    let resizeTimeout: number | undefined

    const setup = () => {
      // cap DPR to 1.5 for performance (2+ is huge pixel count)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // fewer columns on mobile automatically
      const effectiveFontSize = width < 640 ? 16 : fontSize
      columns = Math.floor(width / effectiveFontSize)
      // stale drops keep fraction to avoid pop on resize
      if (drops.length !== columns) {
        const old = drops
        drops = Array.from({ length: columns }, (_, i) => old[i] ?? Math.random() * -80)
        speeds = Array.from({ length: columns }, (_, i) => speeds[i] ?? 0.7 + Math.random() * 1.1)
      }
      ;(ctx as any).font = `${effectiveFontSize}px 'JetBrains Mono', 'Share Tech Mono', monospace`
      ctx.textBaseline = "top"
      // optimize
      ;(ctx as any).imageSmoothingEnabled = false
    }

    const onResize = () => {
      window.clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(setup, 180) as unknown as number
    }

    setup()
    window.addEventListener("resize", onResize, { passive: true })

    // initial fill (opaque)
    ctx.fillStyle = "#030a04"
    ctx.fillRect(0, 0, width, height)

    let lastTime = 0
    const targetInterval = 1000 / 22 // cap at 22fps
    let frameCount = 0

    // Scroll-Optimierung: während Scrollen pausieren - gibt Main-Thread frei für 60fps Scroll
    let isScrolling = false
    let scrollTimeout: number | undefined
    const onScroll = () => {
      isScrolling = true
      window.clearTimeout(scrollTimeout)
      scrollTimeout = window.setTimeout(() => {
        isScrolling = false
        lastTime = performance.now() + 80 // kleiner Delay nach Scroll
      }, 180) as unknown as number
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    // auch wheel/touchmove für schnelles Erkennen
    window.addEventListener("wheel", onScroll, { passive: true })
    window.addEventListener("touchmove", onScroll, { passive: true })

    const draw = (time: number) => {
      // während Scrollen: komplett pausieren für butterweiches Scrollen
      if (isScrolling) {
        animationId = requestAnimationFrame(draw)
        return
      }
      // throttle
      if (time - lastTime < targetInterval) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastTime = time

      // pause wenn Tab nicht sichtbar
      if (document.hidden || document.visibilityState !== "visible") {
        animationId = requestAnimationFrame(draw)
        return
      }

      // also pause if canvas not in viewport? fixed, so always visible - skip check

      // trail effect - slightly higher alpha = shorter trails = weniger Überzeichnen
      ctx.fillStyle = "rgba(3, 10, 5, 0.22)"
      ctx.fillRect(0, 0, width, height)

      // staggered: only draw ~85% of columns each frame, interleave for perceived smoothness
      // this halves draw calls without visible loss at 24fps
      const staggerOffset = frameCount % 7 // 1/7 frames skip each column cyclically
      frameCount++

      for (let i = 0; i < columns; i++) {
        // skip every 7th column each frame
        if (i % 7 === staggerOffset) continue

        const x = i * (width < 640 ? 16 : fontSize)
        const y = drops[i] * (width < 640 ? 16 : fontSize)
        // reduce Math.random calls: reuse one random for char + head check
        const r = Math.random()
        const char = charArray[(r * charArray.length) | 0]

        const isHead = r > 0.96 // ~4% heads
        if (y > -20 && y < height) {
          if (isHead) {
            // head: bright without shadowBlur (shadow is TEUER) - use brighter color + manual glow via double draw
            ctx.fillStyle = "#eaffea"
            // cheap glow: draw twice with low opacity instead of shadowBlur
            ctx.globalAlpha = 0.35
            ctx.fillText(char, x, y)
            ctx.globalAlpha = 1
            ctx.fillStyle = "#eaffea"
            ctx.fillText(char, x, y)
          } else {
            // tail: precomputed green shades without per-pixel Math
            // use simple cycle instead of random brightness each time
            const g = 150 + ((i * 37 + frameCount * 13) % 90) // 150-240 cycle, no Math.random
            ctx.fillStyle = `rgb(0,${g},35)`
            ctx.fillText(char, x, y)
          }
        }

        // glitch char behind - much rarer now
        if (r > 0.997 && y > 0 && y < height) {
          ctx.fillStyle = "rgba(0, 255, 65, 0.14)"
          ctx.fillText(char, x, y - (width < 640 ? 16 : fontSize))
        }

        drops[i] += speeds[i] * 0.5

        if (drops[i] * (width < 640 ? 16 : fontSize) > height && Math.random() > 0.97) {
          drops[i] = Math.random() * -18
          speeds[i] = 0.7 + Math.random() * 1.1
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)

    const onVisibility = () => {
      lastTime = performance.now()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", onScroll)
      window.removeEventListener("touchmove", onScroll)
      document.removeEventListener("visibilitychange", onVisibility)
      window.clearTimeout(resizeTimeout)
      window.clearTimeout(scrollTimeout)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 h-full w-full pointer-events-none"
      style={{
        opacity: 0.30,
        transform: "translateZ(0)",
        willChange: "transform",
        // eigener Compositor-Layer, scrollt nicht mit -> kein Repaint beim Scrollen
      }}
    />
  )
}

// Static Overlays - mit eigenem Compositor-Layer, kein Repaint beim Scrollen
export function MatrixOverlay() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 will-change-transform"
        style={{
          transform: "translateZ(0)",
          background:
            "radial-gradient(ellipse 85% 70% at 50% 38%, rgba(0,255,65,0.06) 0%, rgba(0,255,65,0.025) 22%, transparent 58%), radial-gradient(ellipse 60% 45% at 80% 85%, rgba(0,255,65,0.035) 0%, transparent 55%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 matrix-grid opacity-[0.22] will-change-transform"
        style={{ transform: "translateZ(0)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 matrix-scanlines opacity-[0.08] will-change-transform"
        style={{ transform: "translateZ(0)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 will-change-transform"
        style={{
          transform: "translateZ(0)",
          background:
            "linear-gradient(to bottom, rgba(2,8,3,0.62) 0%, transparent 22%, transparent 78%, rgba(2,8,3,0.72) 100%), radial-gradient(ellipse at center, transparent 56%, rgba(0,0,0,0.48) 100%)",
        }}
      />
    </>
  )
}
