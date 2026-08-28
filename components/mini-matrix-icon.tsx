"use client"

import { useEffect, useRef } from "react"

interface MiniMatrixIconProps {
  size?: number
  className?: string
}

/**
 * Mini-Matrix Icon 36px - OPTIMIERT
 * - 14fps statt 22fps
 * - weniger Columns, kein doppelter Layer
 * - shadowBlur nur für Head, sonst none
 * - pausiert bei hidden / reduced-motion
 */
export function MiniMatrixIcon({ size = 36, className = "" }: MiniMatrixIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true } as any) as CanvasRenderingContext2D | null
    if (!ctx) return

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mediaQuery.matches) {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = size * dpr
      canvas.height = size * dpr
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = "#030a04"
      ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = "#00ff41"
      ctx.font = `bold 16px 'JetBrains Mono', monospace`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("⬢", size / 2, size / 2 + 1)
      return
    }

    // disable on very low-end?
    // keep enabled, but lightweight

    let animationId = 0
    const fontSize = 9
    const chars = "ｱｲｳ01$#"
    const charArray = chars.split("")
    const columns = Math.max(3, Math.floor(size / fontSize))
    let drops = Array.from({ length: columns }, () => Math.random() * -4)
    let speeds = Array.from({ length: columns }, () => 0.85 + Math.random() * 1.0)
    let lastTime = 0
    const targetInterval = 1000 / 14 // 14fps
    // auch hier beim Scrollen pausieren
    let isScrolling = false
    let scrollTimeout: number | undefined
    const onScroll = () => {
      isScrolling = true
      window.clearTimeout(scrollTimeout)
      scrollTimeout = window.setTimeout(() => {
        isScrolling = false
        lastTime = performance.now()
      }, 180) as unknown as number
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("wheel", onScroll, { passive: true })

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(size * dpr)
      canvas.height = Math.floor(size * dpr)
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `700 ${fontSize}px 'JetBrains Mono', 'Share Tech Mono', monospace`
      ctx.textBaseline = "top"
      ;(ctx as any).imageSmoothingEnabled = false
    }

    setup()

    ctx.fillStyle = "#030a04"
    ctx.fillRect(0, 0, size, size)

    const draw = (time: number) => {
      if (isScrolling) {
        animationId = requestAnimationFrame(draw)
        return
      }
      if (time - lastTime < targetInterval) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastTime = time

      if (document.hidden) {
        animationId = requestAnimationFrame(draw)
        return
      }

      ctx.fillStyle = "rgba(3, 10, 5, 0.30)"
      ctx.fillRect(0, 0, size, size)

      for (let i = 0; i < columns; i++) {
        const x = i * fontSize + 1
        const y = drops[i] * fontSize
        // single random
        const r = Math.random()
        const char = charArray[(r * charArray.length) | 0]
        const isHead = r > 0.90

        if (y > -fontSize && y < size) {
          if (isHead) {
            ctx.fillStyle = "#eaffea"
            // cheap glow without shadowBlur: double draw with alpha
            ctx.globalAlpha = 0.45
            ctx.fillText(char, x, y)
            ctx.globalAlpha = 1
            ctx.fillStyle = "#eaffea"
            ctx.fillText(char, x, y)
          } else {
            // feste Farbe ohne random brightness calc
            ctx.fillStyle = i % 2 === 0 ? "#00ff41" : "#00c832"
            ctx.fillText(char, x, y)
          }
        }

        drops[i] += speeds[i] * 0.38

        if (drops[i] * fontSize > size + 6 && Math.random() > 0.85) {
          drops[i] = Math.random() * -3
          speeds[i] = 0.85 + Math.random() * 1.0
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)

    const handleResize = () => setup()
    window.addEventListener("resize", handleResize, { passive: true } as any)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", onScroll)
      window.clearTimeout(scrollTimeout)
    }
  }, [size])

  return (
    <div
      aria-hidden="true"
      className={`relative shrink-0 overflow-hidden rounded-sm bg-[#030a04] border border-[#00ff41]/40 shadow-[0_0_0_1px_rgba(0,255,65,0.14),0_0_12px_rgba(0,255,65,0.32),inset_0_0_8px_rgba(0,255,65,0.10)] ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block"
        style={{ width: size, height: size }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-sm"
        style={{
          boxShadow: "inset 0 0 10px rgba(0,255,65,0.14), inset 0 0 2px rgba(0,255,65,0.28)",
        }}
      />
    </div>
  )
}
