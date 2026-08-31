# 🔒 NP_EMOJI_CRYPT — AES-256-GCM

<div align="center">

```text
>>==============================================================================================<<
||███████╗ ███╗   ███╗  ██████╗       ██╗ ██╗      ██████╗ ██████╗  ██╗   ██╗ ██████╗  ████████╗||
||██╔════╝ ████╗ ████║ ██╔═══██╗      ██║ ██║     ██╔════╝ ██╔══██╗ ╚██╗ ██╔╝ ██╔══██╗ ╚══██╔══╝||
||█████╗   ██╔████╔██║ ██║   ██║      ██║ ██║     ██║      ██████╔╝  ╚████╔╝  ██████╔╝    ██║   ||
||██╔══╝   ██║╚██╔╝██║ ██║   ██║ ██   ██║ ██║     ██║      ██╔══██╗   ╚██╔╝   ██╔═══╝     ██║   ||
||███████╗ ██║ ╚═╝ ██║ ╚██████╔╝ ╚█████╔╝ ██║     ╚██████╗ ██║  ██║    ██║    ██║         ██║   ||
||╚══════╝ ╚═╝     ╚═╝  ╚═════╝   ╚════╝  ╚═╝      ╚═════╝ ╚═╝  ╚═╝    ╚═╝    ╚═╝         ╚═╝   ||
>>==============================================================================================<<
              // STEGANOGRAPHY PROTOCOL v3.0  —  AES-256-GCM // PBKDF2 250k
                    ZERO-KNOWLEDGE  •  VARIATION SELECTORS  •  MATRIX
```

### EMOJI_CRYPT // AES-256-GCM
**[▶ Live Demo → emoji-decoder-encoder.vercel.app](https://emoji-decoder-encoder.vercel.app)**

*WAKE UP, NEO_ • THE MATRIX HAS YOU • FOLLOW THE WHITE RABBIT*

<p align="center">
  <img src="https://img.shields.io/badge/NEXT.JS_14.2.35-011a0f?style=flat-square&logo=nextdotjs&logoColor=00ff41&labelColor=010805" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TYPESCRIPT-011a0f?style=flat-square&logo=typescript&logoColor=00ff41&labelColor=010805" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/NODE-%3E%3D18-011a0f?style=flat-square&logo=nodedotjs&logoColor=00ff41&labelColor=010805" alt="Node"/>
  <a href="LICENSE"><img src="https://img.shields.io/badge/LICENSE-MIT-011a0f?style=flat-square&logo=opensourceinitiative&logoColor=00ff41&labelColor=010805" alt="License"/></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AES--256--GCM-011a0f?style=flat-square&logo=letsencrypt&logoColor=00ff41&labelColor=010805" alt="AES-256-GCM"/>
  <img src="https://img.shields.io/badge/PBKDF2_250K-011a0f?style=flat-square&logo=letsencrypt&logoColor=00ff41&labelColor=010805" alt="PBKDF2 250K"/>
  <img src="https://img.shields.io/badge/ZERO--KNOWLEDGE-011a0f?style=flat-square&logo=shield&logoColor=00ff41&labelColor=010805" alt="Zero Knowledge"/>
  <img src="https://img.shields.io/badge/ZW_STEGANO-011a0f?style=flat-square&logo=code&logoColor=00ff41&labelColor=010805" alt="ZW Stegano"/>
</p>

```
┌─[ SYSTEM ]────────────────────────────────────────────────────┐
│  >_ PAYLOAD wird lokal im Browser verschlüsselt               │
│  >_ Zero-Width U+200B/C/D + U+2060 → 2 Bit/Char (4/Char = 1B) │
│  >_ GCM Tag 128b • Salt 16B • IV 12B • Padding 64B            │
│  >_ Für KI & Server nur Rauschen █ • WhatsApp-sicher          │
└───────────────────────────────────────────────────────────────┘
```

</div>

> **Sicheres Web- & CLI-Tool, um vertrauliche Nachrichten unsichtbar in Emojis zu verstecken.** Basiert auf [`paulgb/emoji-encoder`](https://github.com/paulgb/emoji-encoder) — komplett neu mit **militärischer Kryptographie** und **Matrix-Hacker Design** (`Next 14.2.35` / `React 18` / `Tailwind` / `Web Crypto`).

---

## 🧬 _3D Matrix Look_

```
╔═════════════════════════════════════════════════╗
║ ╔═══╗                                     ╔═══╗ ║
║ ║███║  MATRIX RAIN  010101 010010 110011  ║███║ ║
║ ║███║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║███║ ║
║ ╚═══╝    0110 1001 1100 0011 1010 0101    ╚═══╝ ║
║                ┌──────────────────────────────┐ ║
║   EMOJI_CRYPT  │██████ 36px MATRIX LOCK ██████│ ║
║                └──────────────────────────────┘ ║
║   22fps Canvas • scroll-pause • DPR capped 1.5  ║
╚═════════════════════════════════════════════════╝
```

* **Matrix Rain** Fullscreen `canvas 22fps` (`components/matrix-rain.tsx`) + `MatrixOverlay` Grid/Scanlines/Vignette — `fixed` + `translateZ(0)` für 60fps Scroll, pausiert beim Scrollen.
* **Animated Favicon** `components/matrix-favicon.tsx` 16px Canvas → `toDataURL` alle 480ms — Tab leuchtet.
* **Matrix Lock** `components/matrix-lock-icon.tsx` — SVG Schloss mit Neon-Glow, Grid, Keyhole, `01/10` Binary.
* **Performance:** `backdrop-blur` entfernt, `box-shadow` vereinfacht, `main contain:layout`.

---

## 🛡️ _Warum das Original unsicher war_

| Merkmal | Original `paulgb/emoji-encoder` | **EMOJI_CRYPT Neu** |
| :--- | :--- | :--- |
| Verschlüsselung | ❌ Klartext UTF-8 | ✅ **AES-256-GCM 256-Bit AEAD** |
| Schlüsselschutz | ❌ Jeder liest | ✅ **Zero-Knowledge** (Passwort / Vault-Key) |
| KI-Sicherheit   | ❌ KI liest sofort | ✅ **Mathematisch unknackbar** |
| Längen-Leak     | ❌ Byte-Zahl sichtbar | ✅ **Random Padding 64B** |
| Manipulation    | ❌ Datenmüll | ✅ **GCM 128-Bit Auth Tag** |
| Emoji-Crash     | ❌ Kollidiert bei ❤️ | ✅ **Magic-Header Scan** |

---

## 🔐 _Zwei Modi_

**1. Passwort / Passphrase (Standard):**
> `ENCRYPT` → Text + Passwort → `COPY_EMOJI` → Empfänger `DECRYPT` + selbes Passwort. Fremde sehen nur `🔑 needs_password`.

**2. Privater Vault-Key (Team):**
> `VAULT` Tab → Key in `localStorage` — **nur lokal**, nie über Netzwerk. **Hinweis:** `localStorage` ist bei XSS angreifbar — nur auf vertrauenswürdigen Geräten nutzen und keinen Browser mit unbekannten Extensions verwenden. Für höchste Sicherheit Passwort pro Nachricht bevorzugen.

```ts
// PSK Flow — Beispiel mit starkem Passwort
Alice: encode("Treffpunkt 23h", {password:"Tr0ub4dor&3!Xk9#qL2"}) → 🔒󠇞...
Bob  : decode("🔒󠇞...", {password:"Tr0ub4dor&3!Xk9#qL2"}) → "Treffpunkt 23h"
```

---

## ⚡ _Installation_

```bash
# 1. Klonen
git clone https://github.com/tikogaming1/emoji-decoder-encoder.git emoji-crypt
cd emoji-crypt

# 2. Install (Node ≥18)
npm install --legacy-peer-deps

# 3. Dev
npm run dev
# → http://localhost:3000

# 4. Prod Build (lokal)
npm run build
npm start
# → http://localhost:3000

# 5. Tests & Lint
npm test          # vitest 9 Tests
npm run lint
npx tsc --noEmit
```

> **Security Patch:** `next 14.2.16 → 14.2.35` (`package.json:50`) — `npm audit` von 16 Vulns (2 crit) auf 6 high dev-only reduziert.

---

## 🖥️ _CLI — ohne Browser_

```bash
# encode — nutze starkes Passwort (≥16 Zeichen, gemischt)
node scripts/emoji-crypt.mjs encode "Streng vertraulich" --password 'Tr0ub4dor&3!Xk9#qL2' --emoji 🔒
# → ✅ Verschlüsselt: 🔒󠇞󠇰...

# decode — gleiches Passwort beim Empfänger
node scripts/emoji-crypt.mjs decode "🔒󠇞󠇰..." --password 'Tr0ub4dor&3!Xk9#qL2'
# → 🔓 Streng vertraulich
```

`scripts/emoji-crypt.mjs` nutzt `node:crypto webcrypto` — gleiche `PBKDF2 250k` + `AES-GCM` + Padding wie Web.

---

## 🧩 _Tech Stack_

```
┌─ Next 14.2.35 (App Router) ─ React 18 ─ TypeScript 5 ─ Tailwind 3.4
├─ shadcn/ui + Radix + lucide-react + vaul + recharts
├─ Web Crypto Subtle (AES-GCM, PBKDF2 SHA-256)
└─ Vitest 3.2.7 — 9 Tests
```

**Struktur:**
```
app/
 ├─ layout.tsx        → metadata + MatrixFavicon + JSON-LD
 ├─ page.tsx          → MatrixRain/Overlay + Header + Card (scroll-optimiert)
 ├─ encoding.ts       → AES-GCM, PBKDF2, Padding, VS-Codec
 ├─ encoder-decoder-content.tsx → 4 Tabs + Vault localStorage
 ├─ robots.ts / sitemap.ts → SEO (NEXT_PUBLIC_SITE_URL)
components/
 ├─ matrix-rain.tsx      → Fullscreen Rain 22fps (scroll-pause)
 ├─ matrix-favicon.tsx   → 16px Favicon
 ├─ matrix-lock-icon.tsx → Neon Schloss SVG 36px
 └─ mini-matrix-icon.tsx → 14fps (bereit)
```

---

## 🔬 _Krypto Deep Dive_

```ts
// Vereinfacht — Details in app/encoding.ts
salt = crypto.getRandomValues(16) // 16B
iv   = crypto.getRandomValues(12) // 12B NIST
key  = deriveKey(passphrase, salt, 250000) // PBKDF2 SHA-256
padded = padPlaintext(text) // 64B-Blöcke mit Zufalls-Padding
cipher = AES-GCM-Encrypt(key, iv, padded) // + Auth Tag
payload = [header, salt, iv, cipher] → Zero-Width (4 Chars/Byte)
```

**Entropie:** Passwort-Stärke wird live in Bits + Crack-Time angezeigt. **Tipp:** ≥16 Zeichen, gemischt (Groß/Klein/Zahl/Sonderzeichen) → `Sehr stark`.

---

## 🚀 _Self-Hosting ohne Vercel_

Dieses Repo enthält **keine Vercel-Config** — `.vercel/` und `vercel.json` sind in `.gitignore` und werden nicht gepusht. Deploye selbst:

**Node (empfohlen):**
```bash
npm run build
npm start
# PM2: pm2 start npm --name emoji-crypt -- start
# Docker: FROM node:20-alpine ... COPY . . RUN npm ci && npm run build
```

**SEO:** `app/robots.ts` + `app/sitemap.ts` nutzen `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3000`). Für eigene Domain: `.env` mit `NEXT_PUBLIC_SITE_URL=https://deine-domain.de` setzen, dann erscheint sie in `robots.txt`/`sitemap.xml` und Meta `canonical`.

---

## 🧪 _Tests_

```bash
npm test
# ✓ Password-protected encryption
# ✓ Vault Key group
# ✓ Padding hides length
# ✓ Variation Selectors ❤️/⚠️
# ✓ Non-deterministic Salt/IV
# ✓ GCM Tamper detection
# 9 passed
```

---

## 📜 _Git & Secrets_

* `.env*` + `.vercel/` sind in `.gitignore` — `VERCEL_OIDC_TOKEN` (1h) nie committen
* `git add .` respektiert Ignore, `git check-ignore -v .env.local` → Treffer
* `git push` → bleibt privat bis du in GitHub Settings → Change visibility → Public machst

---

<div align="center">

```
┌───────────────────────────────────────────────────────────────┐
│  >_ WAKE UP, NEO_ • THE MATRIX HAS YOU • FOLLOW WHITE RABBIT  │
│  >_ EMOJI_CRYPT // AES-256-GCM — ZERO-KNOWLEDGE VAULT         │
└───────────────────────────────────────────────────────────────┘
```

**Built with `00ff41` • PRs welcome • MIT**

`github.com/tikogaming1/emoji-decoder-encoder`

</div>
