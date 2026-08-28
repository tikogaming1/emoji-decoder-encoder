#!/usr/bin/env node

/**
 * Pure Vanilla Node.js CLI for Emoji Encryption & Decryption (No dependencies needed!)
 * Uses Node's built-in crypto.subtle (AES-256-GCM + PBKDF2 250k + Random Padding)
 * Zero-Knowledge: Requires a password or vault key.
 *
 * Usage:
 *   node scripts/emoji-crypt.mjs encode "Mein Geheimnis" --password meinPasswort [--emoji 🔒]
 *   node scripts/emoji-crypt.mjs decode "<emoji>" --password meinPasswort
 */

import { webcrypto } from "node:crypto";
const crypto = webcrypto;

const VARIATION_SELECTOR_START = 0xfe00;
const VARIATION_SELECTOR_END = 0xfe0f;
const VARIATION_SELECTOR_SUPPLEMENT_START = 0xe0100;
const VARIATION_SELECTOR_SUPPLEMENT_END = 0xe01ef;

const MAGIC_0 = 0xee;
const MAGIC_V2 = 0x02;
const MAGIC_V3 = 0x03;
const MODE_KEY = 0x02;
const PBKDF2_ROUNDS = 250000;

function toVariationSelector(byte) {
  if (byte >= 0 && byte < 16) {
    return String.fromCodePoint(VARIATION_SELECTOR_START + byte);
  } else if (byte >= 16 && byte < 256) {
    return String.fromCodePoint(VARIATION_SELECTOR_SUPPLEMENT_START + byte - 16);
  }
  return null;
}

function fromVariationSelector(codePoint) {
  if (codePoint >= VARIATION_SELECTOR_START && codePoint <= VARIATION_SELECTOR_END) {
    return codePoint - VARIATION_SELECTOR_START;
  } else if (
    codePoint >= VARIATION_SELECTOR_SUPPLEMENT_START &&
    codePoint <= VARIATION_SELECTOR_SUPPLEMENT_END
  ) {
    return codePoint - VARIATION_SELECTOR_SUPPLEMENT_START + 16;
  }
  return null;
}

async function deriveAesKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ROUNDS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function padPlaintext(text) {
  const plainBytes = new TextEncoder().encode(text);
  const len = plainBytes.length;
  const unpaddedLen = 2 + len;
  const targetLen = Math.ceil(Math.max(unpaddedLen, 64) / 64) * 64;
  const padded = new Uint8Array(targetLen);

  padded[0] = (len >> 8) & 0xff;
  padded[1] = len & 0xff;
  padded.set(plainBytes, 2);

  const paddingLen = targetLen - unpaddedLen;
  if (paddingLen > 0) {
    const randomPadding = crypto.getRandomValues(new Uint8Array(paddingLen));
    padded.set(randomPadding, unpaddedLen);
  }
  return padded;
}

function unpadPlaintext(bytes) {
  if (bytes.length < 2) throw new Error("Ungültiges Padding.");
  const len = (bytes[0] << 8) | bytes[1];
  if (2 + len > bytes.length) throw new Error("Ungültige Padding-Länge.");
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes.slice(2, 2 + len));
}

export async function encode(carrier, plaintext, options = {}) {
  const keySource = (options.password || options.vaultKey || "").trim();
  if (!keySource) {
    throw new Error("Ein Passwort (--password <passwort>) ist erforderlich.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aesKey = await deriveAesKey(keySource, salt);

  const paddedBytes = padPlaintext(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    paddedBytes
  );
  const cipherBytes = new Uint8Array(cipherBuffer);

  const payload = new Uint8Array(3 + 16 + 12 + cipherBytes.length);
  payload[0] = MAGIC_0;
  payload[1] = MAGIC_V3;
  payload[2] = MODE_KEY;
  payload.set(salt, 3);
  payload.set(iv, 19);
  payload.set(cipherBytes, 31);

  let result = carrier;
  for (let i = 0; i < payload.length; i++) {
    const vs = toVariationSelector(payload[i]);
    if (vs) result += vs;
  }
  return result;
}

export async function decode(input, options = {}) {
  const chars = Array.from(input || "");
  const extractedBytes = [];
  const carrierChars = [];

  for (const c of chars) {
    const cp = c.codePointAt(0);
    if (cp !== undefined) {
      const b = fromVariationSelector(cp);
      if (b !== null) {
        extractedBytes.push(b);
      } else {
        carrierChars.push(c);
      }
    }
  }

  if (extractedBytes.length === 0) {
    return { success: false, error: "Keine versteckten Zeichen gefunden." };
  }

  let magicIndex = -1;
  let version = 1;
  for (let i = 0; i <= extractedBytes.length - 2; i++) {
    if (extractedBytes[i] === MAGIC_0) {
      if (extractedBytes[i + 1] === MAGIC_V3) {
        magicIndex = i;
        version = 3;
        break;
      } else if (extractedBytes[i + 1] === MAGIC_V2) {
        magicIndex = i;
        version = 2;
        break;
      }
    }
  }

  const carrierEmoji = (() => {
    if (magicIndex !== -1) {
      let currentVsCount = 0;
      let magicCharIdx = -1;
      for (let i = 0; i < chars.length; i++) {
        const cp = chars[i].codePointAt(0);
        if (cp !== undefined && fromVariationSelector(cp) !== null) {
          if (currentVsCount === magicIndex) {
            magicCharIdx = i;
            break;
          }
          currentVsCount++;
        }
      }

      if (magicCharIdx > 0) {
        let carrierStart = magicCharIdx - 1;
        if (carrierStart > 0 && chars[carrierStart].codePointAt(0) === 0xfe0f) {
          carrierStart--;
        }
        const detected = chars.slice(carrierStart, magicCharIdx).join("");
        if (detected.trim().length > 0) return detected;
      }
    }
    return carrierChars.join("").trim() || "🔒";
  })();

  if (magicIndex === -1) {
    try {
      const legacy = new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(extractedBytes));
      return {
        success: true,
        text: legacy,
        mode: "legacy",
        warning: "⚠️ Veraltetes unverschlüsseltes Format! Nicht vor KIs geschützt.",
      };
    } catch {
      return { success: false, error: "Unbekanntes oder ungültiges Format." };
    }
  }

  const payload = new Uint8Array(extractedBytes.slice(magicIndex));
  if (payload.length < 47) {
    return { success: false, error: "Nachricht ist unvollständig oder beschädigt." };
  }

  const salt = payload.slice(3, 19);
  const iv = payload.slice(19, 31);
  const ciphertext = payload.slice(31);

  const keySource = (options.password || options.vaultKey || "").trim();
  if (!keySource) {
    return {
      success: false,
      needsPassword: true,
      error: "🔑 Passwort erforderlich! Bitte mit '--password <dein_pw>' aufrufen.",
    };
  }

  try {
    const aesKey = await deriveAesKey(keySource, salt);
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      ciphertext
    );
    const decryptedBytes = new Uint8Array(decryptedBuffer);

    let plaintext = "";
    if (version === 3) {
      plaintext = unpadPlaintext(decryptedBytes);
    } else {
      plaintext = new TextDecoder("utf-8", { fatal: true }).decode(decryptedBytes);
    }

    return {
      success: true,
      text: plaintext,
      carrier: carrierEmoji,
      byteCount: payload.length,
      version,
    };
  } catch {
    return { success: false, error: "❌ Falsches Passwort oder manipulierte Daten!" };
  }
}

// CLI Execution
const args = process.argv.slice(2);
const command = args[0];

if (command) {
  function getOption(name) {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
  }

  async function main() {
    const inputParam = args[1];
    const password = getOption("password");
    const emoji = getOption("emoji") || "🔒";

    if (command === "encode") {
      if (!inputParam || !password) {
        console.log('Verwendung: node scripts/emoji-crypt.mjs encode "Mein Text" --password meinPasswort [--emoji 🔒]');
        process.exit(1);
      }
      try {
        const enc = await encode(emoji, inputParam, { password });
        console.log("\n✅ Verschlüsselt:");
        console.log(enc);
      } catch (err) {
        console.error("Fehler:", err.message);
      }
    } else if (command === "decode") {
      if (!inputParam) {
        console.log('Verwendung: node scripts/emoji-crypt.mjs decode "<emoji>" --password meinPasswort');
        process.exit(1);
      }
      const res = await decode(inputParam, { password });
      if (res.success) {
        console.log("\n🔓 Entschlüsselter Text:");
        console.log(res.text);
        if (res.warning) console.log(res.warning);
      } else {
        console.log(`\nFehler: ${res.error}`);
      }
    } else {
      console.log("Verfügbare Befehle: encode, decode");
    }
  }
  main();
}
