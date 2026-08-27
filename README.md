# 🔒 Emoji Krypto-Tresor (KI-Sicherer Emoji Encoder & Decoder)

Ein sicheres Web- & CLI-Tool, um vertrauliche Nachrichten unsichtbar in Emojis zu verstecken. Geschützt mit **echter militärischer AES-256-GCM Verschlüsselung**, **250.000 Runden PBKDF2** und **kryptographischem Längen-Padding**.

Basiert auf der Idee von [`paulgb/emoji-encoder`](https://github.com/paulgb/emoji-encoder), jedoch von Grund auf mit echter Zero-Knowledge-Kryptographie neu entwickelt.

---

## 🛡️ Warum das Original unsicher war – und wie dieser Tresor schützt

| Merkmal | Originales GitHub-Tool | Emoji Krypto-Tresor (Neu) |
| :--- | :--- | :--- |
| **Verschlüsselung** | ❌ Keine (Klartext UTF-8) | ✅ **AES-256-GCM (256-Bit AEAD)** |
| **Schlüsselschutz** | ❌ Jeder kann lesen | ✅ **Zero-Knowledge (Passwort erforderlich)** |
| **KI-Sicherheit** | ❌ KIs lesen UTF-8 sofort aus | ✅ **Mathematisch unknackbar für KI & Supercomputer** |
| **Längen-Verrat** | ❌ Exakte Zeichenanzahl sichtbar | ✅ **Kryptographisches Padding (Vielfaches von 64 B)** |
| **Manipulationsschutz** | ❌ Datenmüll bei Änderungen | ✅ **128-Bit GCM Authentication Tag** |
| **Plattform-Schutz** | ❌ Kollidiert mit Emoji-Selectors (z.B. ❤️) | ✅ **Automatischer Magic-Header-Scan** |

---

## 🚀 Zwei Sicherheits-Möglichkeiten

1. **Passwort / Passphrase (Standard & Höchste Sicherheit):**
   - Jede Nachricht wird mit einem individuellen Passwort verschlüsselt.
   - Der Empfänger muss nur das Passwort eingeben, um das Emoji zu öffnen.
   - Fremde Besucher der Webseite haben keinen Zugriff und sehen nur die Aufforderung zur Passworteingabe.
2. **Privater Tresor-Key (Für Teams / feste Gruppen):**
   - Im Reiter **„Tresor-Key“** kann ein privater Gruppen-Schlüssel hinterlegt werden.
   - Dieser Schlüssel wird **ausschließlich lokal im Browser (`localStorage`)** gespeichert und niemals über das Netzwerk übertragen.
   - Teammitglieder mit demselben gespeicherten Schlüssel können Emojis automatisch entschlüsseln, während fremde Besucher ausgesperrt bleiben.

---

## 💻 Installation & Start

### Voraussetzungen
- **Node.js** (v18 oder höher)

### 1. Projekt vorbereiten
```bash
git clone <dein-repo-url> emoji-tresor
cd emoji-tresor

npm install
```

### 2. Entwicklungsmodus
```bash
npm run dev
```
Rufe `http://localhost:3000` im Browser auf.

### 3. Produktions-Build (Optimiert)
```bash
npm run build
npm start
```

### 4. Tests & Linter ausführen
```bash
npm test     # Führt alle Krypto-Unit-Tests aus
npm run lint # Prüft den Code auf Konformität
```

---

## 🖥️ Direkt im Terminal nutzen (CLI)

Das Tool enthält ein eigenständiges Skript (`scripts/emoji-crypt.mjs`), das ohne Dev-Server direkt mit `node` funktioniert:

```bash
# Nachricht mit Passwort verschlüsseln:
node scripts/emoji-crypt.mjs encode "Streng vertraulich" --password meinPasswort123 --emoji 🔒

# Emoji entschlüsseln:
node scripts/emoji-crypt.mjs decode "🔒󠇞..." --password meinPasswort123
```

---

## 🌐 Veröffentlichung auf Vercel (1-Klick Deployment)

Das Projekt ist vollständig für Vercel optimiert (0 Type-Errors, 0 Lint-Errors):
1. Verbinde dein GitHub-Repository mit [Vercel](https://vercel.com).
2. Klicke auf **Deploy**.
3. Fertig! Da keine universellen Passwörter im Code liegen, kann jeder deine Vercel-Instanz nutzen, ohne dass fremde Personen fremde Emojis lesen können.
