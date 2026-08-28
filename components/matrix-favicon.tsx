"use client"

import { useEffect } from "react"

/**
 * Animierter Matrix-Favicon - PERFORMANT
 * - 16px statt 32px (1/4 Pixel, 1/4 toDataURL Kosten)
 * - 8-10fps statt 16fps, Update nur alle 500ms (2x pro Sekunde)
 * - pausiert bei hidden / reduced-motion
 * - keine shadowBlur im Favicon (zu teuer für 16px)
 */
export function MatrixFavicon() {
  useEffect(() => {
    const originalHref = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⬢</text></svg>`

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (prefersReduced.matches) return

    // disable on low-end devices to keep main thread free
    const lowEnd =
      (navigator as any).hardwareConcurrency !== undefined && (navigator as any).hardwareConcurrency <= 2
    if (lowEnd) return

    // also disable if user has data-saver?
    // @ts-ignore
    if (navigator.connection?.saveData) return

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      document.head.appendChild(link)
    }

    const canvas = document.createElement("canvas")
    const size = 16 // 16px direkt - kein Downscale, minimal toDataURL
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d", { alpha: false } as any) as CanvasRenderingContext2D | null
    if (!ctx) return

    const chars = "ｱｲｳｴ01$#"
    const charArray = chars.split("")
    const fontSize = 7
    const columns = Math.floor(size / fontSize) // ~2 columns at 7px
    let drops = Array.from({ length: columns }, () => Math.random() * -4)
    let speeds = Array.from({ length: columns }, () => 0.5 + Math.random() * 0.9)

    ctx.font = `700 ${fontSize}px 'JetBrains Mono', monospace`
    ctx.textBaseline = "top"
    ;(ctx as any).imageSmoothingEnabled = false

    let animationId = 0
    let lastTime = 0
    let lastFaviconUpdate = 0
    const frameInterval = 1000 / 10 // 10fps intern, aber favicon update seltener
    const faviconInterval = 480 // update favicon nur alle ~0.5s (2x/s) - teuer!

    ctx.fillStyle = "#030a04"
    ctx.fillRect(0, 0, size, size)

    const updateFavicon = () => {
      try {
        // use low quality? PNG is lossless, but 16x16 is tiny (~200 bytes)
        const dataUrl = canvas.toDataURL("image/png")
        link!.href = dataUrl
        link!.type = "image/png"
      } catch {
        // ignore
      }
    }

    const draw = (time: number) => {
      if (time - lastTime < frameInterval) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastTime = time

      if (document.hidden) {
        animationId = requestAnimationFrame(draw)
        return
      }

      ctx.fillStyle = "rgba(3, 10, 5, 0.32)"
      ctx.fillRect(0, 0, size, size)

      for (let i = 0; i < columns; i++) {
        const x = i * fontSize + 1
        const y = drops[i] * fontSize
        const char = charArray[(Math.random() * charArray.length) | 0]
        const isHead = Math.random() > 0.88

        if (y > -fontSize && y < size) {
          ctx.fillStyle = isHead ? "#eaffea" : "#00c832"
          // kein shadowBlur im 16px Favicon - zu teuer, Unterschied kaum sichtbar
          ctx.fillText(char, x, y)
        }

        drops[i] += speeds[i] * 0.36
        if (drops[i] * fontSize > size + 6 && Math.random() > 0.82) {
          drops[i] = Math.random() * -3
          speeds[i] = 0.5 + Math.random() * 0.9
        }
      }

      // throttled favicon push
      if (time - lastFaviconUpdate > faviconInterval) {
        lastFaviconUpdate = time
        updateFavicon()
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        cancelAnimationFrame(animationId)
        link!.href = originalHref
      } else {
        lastTime = performance.now()
        lastFaviconUpdate = 0
        animationId = requestAnimationFrame(draw)
      }
    }
    prefersReduced.addEventListener?.("change", handleMotionChange)

    return () => {
      cancelAnimationFrame(animationId)
      prefersReduced.removeEventListener?.("change", handleMotionChange)
      if (link) link.href = originalHref
    }
  }, [])

  return null
}
