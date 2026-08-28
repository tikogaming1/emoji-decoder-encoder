import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Base64EncoderDecoderContent } from "./encoder-decoder-content"
import { MatrixRain, MatrixOverlay } from "@/components/matrix-rain"
import { Terminal, ShieldCheck, Cpu, Radio } from "lucide-react"

export default function EncoderDecoder() {
  return (
    <main className="relative min-h-screen bg-[#030a04] text-[#a7ffb0] flex flex-col items-center p-3 sm:p-6 sm:py-8 selection:bg-[#00ff41]/30 overscroll-contain">
      {/* Matrix Background */}
      <MatrixRain />
      <MatrixOverlay />

      {/* Top system bar like terminal */}
      <div className="w-full max-w-2xl mb-3 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#00ff41]/70 px-1">
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse" />
            SYSTEM_ONLINE
          </span>
          <span className="hidden sm:inline opacity-60">•</span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <Radio className="w-3 h-3" /> ENCRYPTED_CHANNEL
          </span>
        </span>
        <span className="flex items-center gap-3 opacity-60">
          <span className="hidden sm:inline">NODE: 0xEE::03</span>
          <span>PBKDF2 250k</span>
        </span>
      </div>

      <div className="w-full max-w-2xl space-y-3 my-4 sm:my-6">
        {/* Terminal Window - backdrop-blur entfernt für flüssiges Scrollen (war Haupt-Lag) */}
        <Card className="overflow-hidden border-[#00ff41]/25 bg-[#060f07] shadow-[0_0_0_1px_rgba(0,255,65,0.14),0_0_22px_rgba(0,255,65,0.08)] will-change-transform">
          {/* Window chrome */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#00ff41]/15 bg-[#001208]/80">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/30 shadow-[0_0_6px_rgba(255,95,87,0.5)]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/30 shadow-[0_0_6px_rgba(255,189,46,0.45)]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840] border border-black/30 shadow-[0_0_6px_rgba(40,200,64,0.55)]" />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-[#00ff41]/80">
              <Terminal className="w-3.5 h-3.5" />
              <span>emoji_crypt — zsh — 80×24</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#00ff41]/45">
              <Cpu className="w-3 h-3" />
              <span>AES-256-GCM</span>
            </div>
          </div>

          <CardHeader className="pb-3 pt-4 text-center border-b border-[#00ff41]/10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,65,0.07),transparent_60%)]">
            <div className="flex justify-center mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-mono tracking-widest font-semibold bg-[#001a06] text-[#00ff41] border border-[#00ff41]/30 shadow-[0_0_12px_rgba(0,255,65,0.22)]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="matrix-glow-soft">MIL-GRADE AES-256-GCM // PBKDF2 250k</span>
                <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse shadow-[0_0_6px_#00ff41]" />
              </span>
            </div>

            {/* Glitch / hacker title */}
            <CardTitle className="font-mono tracking-tighter leading-none">
              <span className="block text-[11px] tracking-[0.32em] text-[#00ff41]/60 font-normal mb-1">
                {"//"} STEGANOGRAPHY PROTOCOL v3.0
              </span>
              <span className="text-2xl sm:text-[2rem] font-black tracking-tight text-[#eaffea] matrix-glow">
                EMOJI<span className="text-[#00ff41]">_</span>CRYPT
              </span>
              <span className="ml-1 text-[#00ff41] terminal-caret text-xl align-baseline" aria-hidden />
              <span className="block mt-1 text-[10px] sm:text-xs font-mono font-normal tracking-[0.18em] text-[#00ff41]/55">
                MATRIX EDITION — ZERO-KNOWLEDGE VAULT
              </span>
            </CardTitle>

            <CardDescription className="text-[#7ad68a] font-mono text-[11px] sm:text-xs max-w-lg mx-auto leading-relaxed mt-2">
              <span className="text-[#00ff41]">&gt;</span> Verstecke Payloads unsichtbar in Emojis. Variation Selectors + Random Padding.
              <br className="hidden sm:block" />
              <span className="opacity-70"> Für Menschen unsichtbar. Für KI unknackbar ohne Schlüssel.</span>
            </CardDescription>

            {/* Status line like boot log */}
            <div className="mt-3 mx-auto max-w-xl rounded bg-[#001208] border border-[#00ff41]/15 px-2.5 py-1.5 text-left font-mono text-[10px] leading-[1.35] text-[#6ee07a]">
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                <span>
                  <span className="text-[#00ff41]">[OK]</span> CRYPTO_SUBTLE
                </span>
                <span>
                  <span className="text-[#00ff41]">[OK]</span> ENTROPY_POOL
                </span>
                <span>
                  <span className="text-[#00ff41]">[OK]</span> VS_STEGO
                </span>
                <span className="text-[#00ff41]/60">— ready for injection_</span>
              </div>
            </div>
          </CardHeader>

          <Suspense
            fallback={
              <CardContent className="p-8 text-center font-mono text-xs text-[#00ff41]/70">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#00ff41] animate-ping" />
                  INITIALIZING CRYPTO MODULE...
                </span>
              </CardContent>
            }
          >
            <Base64EncoderDecoderContent />
          </Suspense>
        </Card>

        {/* Footer - neon, gut sichtbar */}
        <footer className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3 py-3 rounded-sm bg-[#001208]/70 border border-[#00ff41]/20 matrix-border-glow font-mono text-[10px] tracking-wide">
          <span className="inline-flex items-center gap-1.5 font-bold text-[#00ff41] matrix-glow-soft">
            <span className="w-1 h-3 bg-[#00ff41] shadow-[0_0_6px_#00ff41]" /> AES-256-GCM + PBKDF2 250,000
          </span>
          <span className="text-[#00ff41]/40">|</span>
          <span className="font-bold text-[#00ff41] matrix-glow">VS STEGANO</span>
          <span className="text-[#00ff41]/50">|</span>
          <span className="font-bold text-[#00ff41] matrix-glow">PADDING 64B</span>
          <span className="text-[#00ff41]/40 hidden sm:inline">|</span>
          <a
            href="https://github.com/paulgb/emoji-encoder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#00ff41] hover:text-[#eaffea] hover:matrix-glow-soft transition-colors border border-[#00ff41]/25 hover:border-[#00ff41]/50 bg-[#00260c]/50 hover:bg-[#00260c] px-2 py-0.5"
          >
            <span>⟶ paulgb/emoji-encoder</span>
          </a>
        </footer>

        <div className="text-center font-mono text-[10px] tracking-[0.22em] text-[#00ff41]/70 matrix-glow-soft pb-3">
          WAKE UP, NEO_ <span className="text-[#00ff41]/35">•</span> THE MATRIX HAS YOU <span className="text-[#00ff41]/35">•</span> FOLLOW THE WHITE RABBIT
        </div>
      </div>
    </main>
  )
}
