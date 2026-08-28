<div align="center">

<pre style="background:#030a04;color:#00ff41;padding:18px 10px;border:1px solid #00ff41;box-shadow:0 0 22px rgba(0,255,65,0.35), inset 0 0 18px rgba(0,255,65,0.06);line-height:1.05;font-size:11px;overflow-x:auto;">
 ███████╗███╗   ███╗  ██████╗      ██╗ ██╗    ██████╗██████╗ ██╗   ██╗██████╗ ████████╗
 ██╔════╝████╗ ████║ ██╔═══██╗     ██║ ██║   ██╔════╝██╔══██╗ ╚██╗ ██╔╝██╔══██╗╚══██╔══╝
 █████╗  ██╔████╔██║ ██║   ██║     ██║ ██║   ██║     ██████╔╝  ╚████╔╝ ██████╔╝   ██║
 ██╔══╝  ██║╚██╔╝██║ ██║   ██║██   ██║ ██║   ██║     ██╔══██╗   ╚██╔╝  ██╔═══╝    ██║
 ███████╗██║ ╚═╝ ██║ ╚██████╔╝╚█████╔╝ ██║   ╚██████╗██║  ██║    ██║   ██║        ██║
 ╚══════╝╚═╝     ╚═╝  ╚═════╝  ╚════╝  ╚═╝    ╚═════╝╚═╝  ╚═╝    ╚═╝   ╚═╝        ╚═╝

              // STEGANOGRAPHY PROTOCOL v3.0  —  AES-256-GCM // PBKDF2 250k
              ZERO-KNOWLEDGE  •  VARIATION SELECTORS  •  MATRIX EDITION
</pre>

<h3 style="color:#00ff41;letter-spacing:0.28em;margin:6px 0 2px 0;">EMOJI_CRYPT // AES-256-GCM</h3>
<p style="color:#7aff7a;font-family:monospace;font-size:12px;letter-spacing:0.14em;margin:0;">WAKE UP, NEO_ • THE MATRIX HAS YOU • FOLLOW THE WHITE RABBIT</p>

<p>
  <a href="https://emoji-decoder-encoder.vercel.app"><img src="https://img.shields.io/badge/LIVE_DEMO-00ff41?style=for-the-badge&logo=vercel&logoColor=black&labelColor=001208" alt="Live Demo"/></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/DEPLOY-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/NEXT.JS_14.2.35-00ff41?style=for-the-badge&logo=nextdotjs&logoColor=black&labelColor=001208" alt="Next.js"/></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <img src="https://img.shields.io/badge/LICENSE-MIT-00ff41?style=for-the-badge&labelColor=001208&color=00ff41" alt="License"/>
</p>

<p>
  <img src="https://img.shields.io/badge/AES--256--GCM-00ff41?style=for-the-badge&labelColor=001208&color=00ff41" alt="AES"/>
  <img src="https://img.shields.io/badge/PBKDF2_250k-001208?style=for-the-badge&logo=letsencrypt&logoColor=00ff41&labelColor=001208&color=00ff41" alt="PBKDF2"/>
  <img src="https://img.shields.io/badge/ZERO--KNOWLEDGE-00ff41?style=for-the-badge&labelColor=001208" alt="Zero Knowledge"/>
  <img src="https://img.shields.io/badge/VS_STEGANO-001208?style=for-the-badge&labelColor=001208&color=00ff41" alt="VS"/>
</p>

```
┌─[ SYSTEM ]────────────────────────────────────────────────────┐
│  >_ PAYLOAD wird lokal im Browser verschlüsselt               │
│  >_ Variation Selectors U+FE00..U+E01EF → 1 Byte/Char         │
│  >_ GCM Tag 128b • Salt 16B • IV 12B • Padding 64B            │
│  >_ Für KI & Server nur Rauschen █                            │
└───────────────────────────────────────────────────────────────┘
```

</div>

---

<div align="center">

| `> SYSTEM_ONLINE` | `ENCRYPTED_CHANNEL` | `NODE: 0xEE::03` | `PBKDF2 250k` |
|:---:|:---:|:---:|:---:|

</div>

> **Ein sicheres Web- & CLI-Tool, um vertrauliche Nachrichten unsichtbar in Emojis zu verstecken.** Basiert auf der Idee von [`paulgb/emoji-encoder`](https://github.com/paulgb/emoji-encoder) — aber komplett neu gebaut mit **echter militärischer Kryptographie** (`Next 14.2.35` / `React 18` / `Tailwind` / `Web Crypto`).

**Live:** **https://emoji-decoder-encoder.vercel.app**
---

## 🧬 _Was ist neu? — 3D Matrix Look_

```ansi
\x1b[32m     ╔══════════════════════════════════════════════════════════╗
     ║  ███╗   MATRIX RAIN  010101 010010 110011  ███╗          ║
     ║  ███║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ███║          ║
     ║  ╚═╝   0110 1001 1100 0011 1010 0101   ╚═╝          ║
     ║   EMOJI_CRYPT  [██████ 36px MATRIX LOCK ██████]   ║
     ║   22fps Canvas • 14fps Mini-Icon • 10fps Favicon   ║
     ║   translateZ(0) • scroll-pause • DPR capped 1.5    ║
     ╚══════════════════════════════════════════════════════════╝\x1b[0m
```

* **Matrix Rain** Fullscreen `canvas 22fps` (`components/matrix-rain.tsx:5`) + `MatrixOverlay` Grid/Scanlines/Vignette — `fixed` + `translateZ(0)` für 60fps Scroll, pausiert beim Scrollen.
* **Animated Favicon** `components/matrix-favicon.tsx:12` 16px Canvas → `toDataURL` alle 480ms (2×/s) — Tab leuchtet.
* **Matrix Lock** `components/matrix-lock-icon.tsx:9` — SVG Schloss mit Neon-Glow, Grid, Keyhole, `01/10` Binary, Schrauben (`size={36}` in `app/encoder-decoder-content.tsx:523`).
* **Performance:** `backdrop-blur` entfernt, `box-shadow` vereinfacht, `main contain:layout`, Scroll-Pause für Rain + Mini-Icon.

---

## 🛡️ _Warum das Original unsicher war_

| Merkmal | Original `paulgb/emoji-encoder` | **EMOJI_CRYPT Neu** |
| :--- | :--- | :--- |
| **Verschlüsselung** | ❌ Klartext UTF-8 | ✅ **AES-256-GCM 256-Bit AEAD** (`app/encoding.ts:199`) |
| **Schlüsselschutz** | ❌ Jeder liest | ✅ **Zero-Knowledge** (Passwort / Vault-Key) |
| **KI-Sicherheit** | ❌ KI liest UTF-8 sofort | ✅ **Mathematisch unknackbar** |
| **Längen-Leak** | ❌ Exakte Byte-Zahl sichtbar | ✅ **Random Padding 64B** (`app/encoding.ts:100`) |
| **Manipulation** | ❌ Datenmüll | ✅ **GCM 128-Bit Auth Tag** |
| **Emoji-Crash** | ❌ Kollidiert bei ❤️ | ✅ **Magic-Header Scan** `0xEE 0x03` (`app/encoding.ts:275`) |

---

## 🔐 _Zwei Modi_

**1. Passwort / Passphrase (Standard):**
> `> ENCRYPT` → Text + Passwort → `COPY_EMOJI` → Empfänger `DECRYPT` + selbes Passwort. Fremde sehen nur `🔑 needs_password`.

**2. Privater Vault-Key (Team):**
> `VAULT` Tab → Key in `localStorage:emoji_private_vault_key` (`app/encoder-decoder-content.tsx:77`) — **nur lokal**, nie über Netzwerk. Team mit gleichem Key entschlüsselt auto, Fremde ausgesperrt.

```
// PSK Flow
 Alice: encode("Treffpunkt 23h", {password:"s3cr3t!"}) → 🔒󠇞...
 Bob  : decode("🔒󠇞...", {password:"s3cr3t!"}) → "Treffpunkt 23h"
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

# 4. Prod Build
npm run build
npm start

# 5. Tests & Lint
npm test          # vitest 9 Tests GCM/Padding/Salt-IV
npm run lint
npx tsc --noEmit
```

> **Security Patch:** `next 14.2.16 → 14.2.35` (`package.json:50`) + `eslint-config-next 14.2.35` — `npm audit` von 16 Vulns (2 crit) auf 6 high dev-only reduziert. Rest (`glob`/`picomatch` via eslint) ist Build-Time only, kein Prod-Risk (`images.unoptimized:true`).

---

## 🖥️ _CLI — ohne Browser_

```bash
# encode
node scripts/emoji-crypt.mjs encode "Streng vertraulich" --password meinPasswort123 --emoji 🔒
# → ✅ Verschlüsselt: 🔒󠇞󠇰...

# decode
node scripts/emoji-crypt.mjs decode "🔒󠇞󠇰..." --password meinPasswort123
# → 🔓 Streng vertraulich
```

`scripts/emoji-crypt.mjs:13` nutzt `node:crypto webcrypto` — kein `npm` nötig, gleiche `PBKDF2 250k` + `AES-GCM` + Padding wie Web.

---

## 🧩 _Tech Stack_

```
┌─ Next 14.2.35 (App Router) ─ React 18 ─ TypeScript 5 ─ Tailwind 3.4
├─ shadcn/ui + Radix + lucide-react + vaul + recharts
├─ Web Crypto Subtle (AES-GCM, PBKDF2 SHA-256)
├─ Vitest 3.2.7  — 9 Tests
├─ @vercel/speed-insights 2.0.0
└─ Deployed on Vercel — PRERENDER, HSTS, Speed Insights, Sitemap
```

**Struktur:**
```
app/
 ├─ layout.tsx        → metadata + SpeedInsights + MatrixFavicon + JSON-LD
 ├─ page.tsx          → MatrixRain/Overlay + Header + Card (scroll-optimiert)
 ├─ encoding.ts       → AES-GCM, PBKDF2, Padding, VS-Codec
 ├─ encoder-decoder-content.tsx → 4 Tabs + Vault localStorage
 ├─ robots.ts / sitemap.ts
components/
 ├─ matrix-rain.tsx   → Fullscreen Rain 22fps (scroll-pause)
 ├─ matrix-favicon.tsx→ 16px Favicon 10fps / 480ms toDataURL
 ├─ matrix-lock-icon.tsx → Neon Schloss SVG 36px
 └─ mini-matrix-icon.tsx → 14fps (ungenutzt nach Title-Entfernung, bereit)
```

---

## 🔬 _Krypto Deep Dive_

```ts
// app/encoding.ts:190
salt = crypto.getRandomValues(16) // 16B
iv   = crypto.getRandomValues(12) // 12B NIST
key  = await deriveKey(passphrase, salt, 250000) // PBKDF2 SHA-256
padded = padPlaintext(text) // [len MSB, len LSB, ...text, ...random] → 64B
cipher = await subtle.encrypt({name:"AES-GCM", iv}, key, padded) // +16B Tag
payload = [0xEE, 0x03, 0x02, salt(16), iv(12), cipher...] → VS-Encode
// VS: U+FE00..FE0F (0x00-0x0F) + U+E0100..E01EF (0x10-0xFF) → 1 Byte/Char unsichtbar
```

**Entropie:** `calculatePasswordEntropy` (`app/encoding.ts:430`) → Bit + Crack-Time.

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

<div align="center">

```
┌───────────────────────────────────────────────────────────────┐
│  >_ WAKE UP, NEO_ • THE MATRIX HAS YOU • FOLLOW WHITE RABBIT  │
│  >_ EMOJI_CRYPT // AES-256-GCM — ZERO-KNOWLEDGE VAULT         │
└───────────────────────────────────────────────────────────────┘
```

**Built with `00ff41` • PRs welcome • MIT**

`github.com/tikogaming1/emoji-decoder-encoder` — `vercel.com/timonkottig-9457/emoji-decoder-encoder`

</div>
