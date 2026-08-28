// Unicode Variation Selectors mapping (Legacy — nur für Decode alter Emojis)
export const VARIATION_SELECTOR_START = 0xfe00;
export const VARIATION_SELECTOR_END = 0xfe0f;
export const VARIATION_SELECTOR_SUPPLEMENT_START = 0xe0100;
export const VARIATION_SELECTOR_SUPPLEMENT_END = 0xe01ef;

// Zero-Width steganography (WhatsApp-sicher, primär)
// U+200B ZWSP = 00, U+200C ZWNJ = 01, U+200D ZWJ = 10, U+2060 WORD JOINER = 11
export const ZWSP = 0x200b;
export const ZWNJ = 0x200c;
export const ZWJ = 0x200d;
export const WJ = 0x2060;
export const ZERO_WIDTH_CHARS = [ZWSP, ZWNJ, ZWJ, WJ] as const;

// Magic Header bytes to identify encrypted payloads
export const MAGIC_0 = 0xee;
export const MAGIC_V2 = 0x02; // Version 2 (Unpadded AES-256-GCM)
export const MAGIC_V3 = 0x03; // Version 3 (Padded AES-256-GCM, prevents length leakage)

export const MODE_KEY = 0x02;

export const PBKDF2_ITERATIONS = 250000;

export function toVariationSelector(byte: number): string | null {
  if (byte >= 0 && byte < 16) {
    return String.fromCodePoint(VARIATION_SELECTOR_START + byte);
  } else if (byte >= 16 && byte < 256) {
    return String.fromCodePoint(VARIATION_SELECTOR_SUPPLEMENT_START + byte - 16);
  } else {
    return null;
  }
}

export function fromVariationSelector(codePoint: number): number | null {
  if (codePoint >= VARIATION_SELECTOR_START && codePoint <= VARIATION_SELECTOR_END) {
    return codePoint - VARIATION_SELECTOR_START;
  } else if (
    codePoint >= VARIATION_SELECTOR_SUPPLEMENT_START &&
    codePoint <= VARIATION_SELECTOR_SUPPLEMENT_END
  ) {
    return codePoint - VARIATION_SELECTOR_SUPPLEMENT_START + 16;
  } else {
    return null;
  }
}

// Zero-Width helpers (2 Bit pro Char, 4 Chars = 1 Byte)
export function byteToZeroWidth(byte: number): string {
  let s = "";
  for (let i = 3; i >= 0; i--) {
    const bits = (byte >> (i * 2)) & 0x03;
    s += String.fromCodePoint(ZERO_WIDTH_CHARS[bits]);
  }
  return s;
}

export function zeroWidthValue(codePoint: number): number | null {
  if (codePoint === ZWSP) return 0;
  if (codePoint === ZWNJ) return 1;
  if (codePoint === ZWJ) return 2;
  if (codePoint === WJ) return 3;
  return null;
}

export function isZeroWidth(codePoint: number): boolean {
  return zeroWidthValue(codePoint) !== null;
}

function getCryptoSubtle(): SubtleCrypto {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error("Web Crypto API is not available in this environment.");
}

function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto.getRandomValues(array);
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    return globalThis.crypto.getRandomValues(array);
  }
  throw new Error("Web Crypto getRandomValues is not available.");
}

export async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  iterations = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const subtle = getCryptoSubtle();
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function padPlaintext(text: string): Uint8Array {
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
    const randomPadding = getRandomValues(new Uint8Array(paddingLen));
    padded.set(randomPadding, unpaddedLen);
  }
  return padded;
}

function unpadPlaintext(bytes: Uint8Array): string {
  if (bytes.length < 2) throw new Error("Ungültiges Padding.");
  const len = (bytes[0] << 8) | bytes[1];
  if (2 + len > bytes.length) throw new Error("Ungültige Padding-Länge.");
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes.slice(2, 2 + len));
}

export interface EncodeOptions {
  password?: string;
  vaultKey?: string;
}

export interface DecryptSuccess {
  status: "success";
  text: string;
  mode: "password" | "vault_key" | "legacy";
  warning?: string;
  carrierEmoji: string;
  hiddenByteCount: number;
  saltHex?: string;
  ivHex?: string;
  version: number;
}

export interface DecryptNeedsPassword {
  status: "needs_password";
  error: string;
  carrierEmoji: string;
  hiddenByteCount: number;
}

export interface DecryptInvalidPassword {
  status: "invalid_password";
  error: string;
  carrierEmoji: string;
  hiddenByteCount: number;
}

export interface DecryptError {
  status: "error";
  error: string;
}

export type DecryptResult =
  | DecryptSuccess
  | DecryptNeedsPassword
  | DecryptInvalidPassword
  | DecryptError;

/**
 * Encrypts `text` using AES-256-GCM and embeds via Zero-Width chars (WhatsApp-sicher).
 * Fallback für alte VS-Emojis bleibt beim Decoden erhalten.
 */
export async function encode(
  carrier: string,
  text: string,
  options: EncodeOptions = {}
): Promise<string> {
  if (!text) {
    return carrier;
  }

  const effectiveKey = (options.password || options.vaultKey || "").trim();
  if (!effectiveKey) {
    throw new Error("Ein Passwort oder Tresor-Schlüssel ist erforderlich.");
  }

  const subtle = getCryptoSubtle();

  const salt = getRandomValues(new Uint8Array(16));
  const iv = getRandomValues(new Uint8Array(12));

  const aesKey = await deriveKey(effectiveKey, salt);

  const paddedPlaintext = padPlaintext(text);

  const cipherBuffer = await subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    paddedPlaintext
  );
  const cipherBytes = new Uint8Array(cipherBuffer);

  const totalLength = 3 + 16 + 12 + cipherBytes.length;
  const payload = new Uint8Array(totalLength);
  payload[0] = MAGIC_0;
  payload[1] = MAGIC_V3;
  payload[2] = MODE_KEY;
  payload.set(salt, 3);
  payload.set(iv, 19);
  payload.set(cipherBytes, 31);

  // Zero-Width Steganographie (4 Chars pro Byte)
  let encoded = carrier;
  for (let i = 0; i < payload.length; i++) {
    encoded += byteToZeroWidth(payload[i]);
  }

  return encoded;
}

export interface DecodeOptions {
  password?: string;
  vaultKey?: string;
}

// Helper: extrahiere Zero-Width Bytes
function extractZeroWidth(input: string): { bytes: number[]; carrierChars: string[]; zwCharCount: number; chars: string[] } {
  const chars = Array.from(input);
  const carrierChars: string[] = [];
  const zwValues: number[] = [];
  let zwCharCount = 0;
  for (const char of chars) {
    const cp = char.codePointAt(0);
    if (cp !== undefined) {
      const v = zeroWidthValue(cp);
      if (v !== null) {
        zwValues.push(v);
        zwCharCount++;
      } else {
        carrierChars.push(char);
      }
    }
  }
  const bytes: number[] = [];
  for (let i = 0; i + 3 < zwValues.length; i += 4) {
    const b = (zwValues[i] << 6) | (zwValues[i + 1] << 4) | (zwValues[i + 2] << 2) | zwValues[i + 3];
    bytes.push(b);
  }
  return { bytes, carrierChars, zwCharCount, chars };
}

function extractVariationSelector(input: string): { bytes: number[]; carrierChars: string[]; chars: string[] } {
  const chars = Array.from(input);
  const carrierChars: string[] = [];
  const bytes: number[] = [];
  for (const char of chars) {
    const cp = char.codePointAt(0);
    if (cp !== undefined) {
      const b = fromVariationSelector(cp);
      if (b !== null) {
        bytes.push(b);
      } else {
        carrierChars.push(char);
      }
    }
  }
  return { bytes, carrierChars, chars };
}

export async function decode(
  input: string,
  options: DecodeOptions = {}
): Promise<DecryptResult> {
  if (!input || input.length === 0) {
    return { status: "error", error: "Bitte ein Emoji oder Text eingeben." };
  }

  // 1. Versuche Zero-Width (primär, WhatsApp-sicher)
  const zw = extractZeroWidth(input);
  let extractedBytes = zw.bytes;
  let carrierChars = zw.carrierChars;
  let chars = zw.chars;
  let isZW = zw.bytes.length > 0;
  let zwCharCount = zw.zwCharCount;

  // 2. Falls kein ZW oder kein Magic in ZW, fallback auf Variation Selectors (Legacy)
  let magicIndex = -1;
  let version = 1;
  const findMagic = (bytes: number[]) => {
    for (let i = 0; i <= bytes.length - 2; i++) {
      if (bytes[i] === MAGIC_0) {
        if (bytes[i + 1] === MAGIC_V3) return { idx: i, ver: 3 };
        if (bytes[i + 1] === MAGIC_V2) return { idx: i, ver: 2 };
      }
    }
    return null;
  };

  let magic = findMagic(extractedBytes);
  if (magic) {
    magicIndex = magic.idx;
    version = magic.ver;
  } else {
    // kein Magic in ZW → probiere VS
    const vs = extractVariationSelector(input);
    if (vs.bytes.length > 0) {
      const vsMagic = findMagic(vs.bytes);
      if (vsMagic) {
        extractedBytes = vs.bytes;
        carrierChars = vs.carrierChars;
        chars = vs.chars;
        magicIndex = vsMagic.idx;
        version = vsMagic.ver;
        isZW = false;
      } else if (vs.bytes.length > extractedBytes.length) {
        // kein Magic, aber VS hat mehr Bytes → Legacy Fallback braucht VS Bytes
        // behalte ZW für Fehlerfall? Für Legacy nehmen wir VS wenn ZW leer war
        if (zw.bytes.length === 0) {
          extractedBytes = vs.bytes;
          carrierChars = vs.carrierChars;
          chars = vs.chars;
          isZW = false;
        }
      }
    }
  }

  if (extractedBytes.length === 0) {
    return {
      status: "error",
      error: "Keine versteckte Nachricht in diesem Text oder Emoji gefunden.",
    };
  }

  const carrierEmoji = (() => {
    if (magicIndex !== -1) {
      if (isZW) {
        // ZW: jedes Byte = 4 ZW-Chars, Magic bei Byte-Index *4
        let zwCount = 0;
        let magicCharIdx = -1;
        for (let i = 0; i < chars.length; i++) {
          const cp = chars[i].codePointAt(0);
          if (cp !== undefined && isZeroWidth(cp)) {
            if (Math.floor(zwCount / 4) === magicIndex && zwCount % 4 === 0) {
              magicCharIdx = i;
              break;
            }
            zwCount++;
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
      } else {
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
    }
    return carrierChars.join("").trim() || "🔒";
  })();

  if (magicIndex === -1) {
    try {
      const legacyBytes = new Uint8Array(extractedBytes);
      const decoded = new TextDecoder("utf-8", { fatal: true }).decode(legacyBytes);
      if (decoded.length > 0) {
        return {
          status: "success",
          text: decoded,
          mode: "legacy",
          warning:
            "⚠️ Veraltetes unverschlüsseltes Format erkannt! Dieser Text wurde ohne Verschlüsselung gespeichert und kann von KIs direkt ausgelesen werden.",
          carrierEmoji,
          hiddenByteCount: extractedBytes.length,
          version: 1,
        };
      }
    } catch {
      return {
        status: "error",
        error: "Keine lesbare oder gültige versteckte Nachricht gefunden.",
      };
    }
  }

  const payload = new Uint8Array(extractedBytes.slice(magicIndex));

  if (payload.length < 47) {
    return {
      status: "error",
      error: "Die versteckte Nachricht ist unvollständig oder beschädigt.",
    };
  }

  const salt = payload.slice(3, 19);
  const iv = payload.slice(19, 31);
  const ciphertext = payload.slice(31);

  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const candidateKeys: { key: string; mode: "password" | "vault_key" }[] = [];
  if (options.password && options.password.trim().length > 0) {
    candidateKeys.push({ key: options.password.trim(), mode: "password" });
  }
  if (options.vaultKey && options.vaultKey.trim().length > 0) {
    candidateKeys.push({ key: options.vaultKey.trim(), mode: "vault_key" });
  }

  if (candidateKeys.length === 0) {
    return {
      status: "needs_password",
      error:
        "🔑 Dieses Emoji ist verschlüsselt. Bitte gib das Passwort ein, um die Nachricht zu entschlüsseln.",
      carrierEmoji,
      hiddenByteCount: payload.length,
    };
  }

  const subtle = getCryptoSubtle();

  for (const candidate of candidateKeys) {
    try {
      const aesKey = await deriveKey(candidate.key, salt);
      const decryptedBuffer = await subtle.decrypt(
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
        status: "success",
        text: plaintext,
        mode: candidate.mode,
        carrierEmoji,
        hiddenByteCount: payload.length,
        saltHex,
        ivHex,
        version,
      };
    } catch {
      // Try next candidate
    }
  }

  return {
    status: "invalid_password",
    error: "❌ Falsches Passwort oder manipulierte Nachricht. Entschlüsselung fehlgeschlagen.",
    carrierEmoji,
    hiddenByteCount: payload.length,
  };
}

export function calculatePasswordEntropy(password: string): {
  entropyBits: number;
  strengthLabel: "Sehr schwach" | "Schwach" | "Mittel" | "Stark" | "Sehr stark";
  crackTimeEstimate: string;
} {
  if (!password || password.length === 0) {
    return { entropyBits: 0, strengthLabel: "Sehr schwach", crackTimeEstimate: "Sofort" };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const entropy = password.length * Math.log2(Math.max(poolSize, 2));

  let strengthLabel: "Sehr schwach" | "Schwach" | "Mittel" | "Stark" | "Sehr stark" = "Sehr schwach";
  let crackTimeEstimate = "Sofort";

  if (entropy < 28) {
    strengthLabel = "Sehr schwach";
    crackTimeEstimate = "Wenige Millisekunden";
  } else if (entropy < 45) {
    strengthLabel = "Schwach";
    crackTimeEstimate = "Einige Minuten bis Stunden";
  } else if (entropy < 65) {
    strengthLabel = "Mittel";
    crackTimeEstimate = "Mehrere Tage bis Monate";
  } else if (entropy < 85) {
    strengthLabel = "Stark";
    crackTimeEstimate = "Jahrhunderte";
  } else {
    strengthLabel = "Sehr stark";
    crackTimeEstimate = "Milliarden Jahre (Unknackbar)";
  }

  return { entropyBits: Math.round(entropy), strengthLabel, crackTimeEstimate };
}

export interface InspectionData {
  carrier: string;
  totalLength: number;
  variationSelectorCount: number;
  isEncrypted: boolean;
  shannonEntropy: number;
  byteCount: number;
  sampleHex: string;
  summaryForAi: string;
  isPadded: boolean;
}

export function inspectEmojiString(input: string): InspectionData {
  const chars = Array.from(input || "");
  const carrierChars: string[] = [];
  const bytes: number[] = [];
  let isZWMode = false;

  // Erst ZW versuchen
  const zwVals: number[] = [];
  let hasZW = false;
  for (const c of chars) {
    const cp = c.codePointAt(0);
    if (cp !== undefined) {
      const v = zeroWidthValue(cp);
      if (v !== null) {
        hasZW = true;
        zwVals.push(v);
      } else if (fromVariationSelector(cp) === null) {
        // nur wenn weder ZW noch VS -> Carrier
        // aber für VS-Erkennung brauchen wir separate Prüfung
      }
    }
  }
  if (hasZW) {
    for (let i = 0; i + 3 < zwVals.length; i += 4) {
      const b = (zwVals[i] << 6) | (zwVals[i + 1] << 4) | (zwVals[i + 2] << 2) | zwVals[i + 3];
      bytes.push(b);
    }
    // Carrier sind alle Nicht-ZW
    for (const c of chars) {
      const cp = c.codePointAt(0);
      if (cp !== undefined && zeroWidthValue(cp) === null && fromVariationSelector(cp) === null) {
        // aber VS-Teile eines Carriers wie ❤️ (FE0F) sollen nicht als hidden zählen
        // ZW hat keine Kollision, also einfach alle Nicht-ZW als Carrier
        // Für korrekten Carrier bei ZW: nimm alle Nicht-ZW
        if (zeroWidthValue(cp) === null) {
          // check if it's VS part of carrier - should stay carrier
          carrierChars.push(c);
          // actually we double push? fix: we already filter ZW only
        }
      }
    }
    // simpler: carrier = alle Zeichen die kein ZW sind, aber ZW-Check oben hat schon hasZW, also für isZW mode carrier = non-ZW
    // Reset and correctly fill:
    carrierChars.length = 0;
    for (const c of chars) {
      const cp = c.codePointAt(0);
      if (cp !== undefined && zeroWidthValue(cp) === null) {
        // VS-Teile bleiben beim Carrier (z.B. ❤️)
        carrierChars.push(c);
      }
    }
    isZWMode = true;
  }

  if (!hasZW) {
    for (const c of chars) {
      const cp = c.codePointAt(0);
      if (cp !== undefined) {
        const b = fromVariationSelector(cp);
        if (b !== null) {
          bytes.push(b);
        } else {
          carrierChars.push(c);
        }
      }
    }
  }

  const carrier = carrierChars.join("") || (chars.length > 0 ? chars[0] : "—");
  const byteCount = bytes.length;

  if (byteCount === 0) {
    return {
      carrier,
      totalLength: chars.length,
      variationSelectorCount: 0,
      isEncrypted: false,
      shannonEntropy: 0,
      byteCount: 0,
      sampleHex: "Keine versteckten Bytes vorhanden",
      summaryForAi: "Keine versteckten Zeichen gefunden.",
      isPadded: false,
    };
  }

  const freq = new Array(256).fill(0);
  for (const b of bytes) freq[b]++;
  let entropy = 0;
  for (const f of freq) {
    if (f > 0) {
      const p = f / bytes.length;
      entropy -= p * Math.log2(p);
    }
  }

  let magicIndex = -1;
  let isV3 = false;
  for (let i = 0; i <= bytes.length - 2; i++) {
    if (bytes[i] === MAGIC_0) {
      if (bytes[i + 1] === MAGIC_V3) {
        magicIndex = i;
        isV3 = true;
        break;
      } else if (bytes[i + 1] === MAGIC_V2) {
        magicIndex = i;
        break;
      }
    }
  }

  const isEncrypted = magicIndex !== -1;
  const sampleHex = bytes
    .slice(0, 32)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ") + (bytes.length > 32 ? " …" : "");

  let summaryForAi = "";
  if (isEncrypted) {
    summaryForAi = `🔒 KRYPTOGRAPHISCH GESICHERT (AES-256-GCM, PBKDF2 250k Runden${
      isV3 ? ", Längen-Padding aktiv" : ""
    }, ${isZWMode ? "Zero-Width WhatsApp-sicher" : "Legacy VS"}). Die Rohdaten besitzen eine Entropie von ${entropy.toFixed(
      2
    )}/8.0 Bit (hohes pseudozufälliges Rauschen). Für jede KI mathematisch unlösbar ohne den geheimen Schlüssel.`;
  } else {
    summaryForAi = `⚠️ UNVERSCHLÜSSELTES LEGACY-FORMAT. Die Bytes entsprechen direktem UTF-8 Text. Jede KI kann diese Zeichen mit Leichtigkeit auslesen!`;
  }

  return {
    carrier,
    totalLength: chars.length,
    variationSelectorCount: bytes.length,
    isEncrypted,
    shannonEntropy: entropy,
    byteCount,
    sampleHex,
    summaryForAi,
    isPadded: isV3,
  };
}
