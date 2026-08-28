// Unicode Variation Selectors mapping
// VS1..=VS16 (Unicode U+FE00 .. U+FE0F) -> 16 byte values (0x00 .. 0x0F)
export const VARIATION_SELECTOR_START = 0xfe00;
export const VARIATION_SELECTOR_END = 0xfe0f;

// Variation Selectors Supplement (Unicode U+E0100 .. U+E01EF) -> 240 byte values (0x10 .. 0xFF)
export const VARIATION_SELECTOR_SUPPLEMENT_START = 0xe0100;
export const VARIATION_SELECTOR_SUPPLEMENT_END = 0xe01ef;

// Magic Header bytes to identify encrypted payloads
export const MAGIC_0 = 0xee; // Emoji Encoder
export const MAGIC_V2 = 0x02; // Version 2 (Unpadded AES-256-GCM)
export const MAGIC_V3 = 0x03; // Version 3 (Padded AES-256-GCM, prevents length leakage)

// Encryption modes
export const MODE_KEY = 0x02; // Authenticated AES-256-GCM with User Password or Private Vault Key

// Number of PBKDF2 iterations for key derivation
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

/**
 * Derives a 256-bit AES-GCM key from a passphrase and salt using PBKDF2 with 250,000 iterations.
 */
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

/**
 * Pads plaintext to a multiple of 64 bytes with random bytes to prevent length leakage (Traffic Analysis).
 * Format: [Length MSB, Length LSB, ...plaintextBytes, ...randomPaddingBytes]
 */
function padPlaintext(text: string): Uint8Array {
  const plainBytes = new TextEncoder().encode(text);
  const len = plainBytes.length;
  const unpaddedLen = 2 + len;
  // Pad to multiple of 64 bytes (minimum 64 bytes)
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
 * Encrypts `text` using AES-256-GCM with random padding, and embeds the ciphertext into variation selectors
 * appended to `carrier` emoji/character.
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

  // Generate cryptographically random 16-byte salt and 12-byte IV (NIST GCM standard)
  const salt = getRandomValues(new Uint8Array(16));
  const iv = getRandomValues(new Uint8Array(12));

  // Derive AES-256 key with 250,000 PBKDF2 rounds
  const aesKey = await deriveKey(effectiveKey, salt);

  // Cryptographic random padding to hide message length
  const paddedPlaintext = padPlaintext(text);

  const cipherBuffer = await subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    paddedPlaintext
  );
  const cipherBytes = new Uint8Array(cipherBuffer);

  // Payload structure (Version 3):
  // [0] Magic 0 (0xEE)
  // [1] Magic 1 (0x03 = Padded AES-256-GCM)
  // [2] Mode (0x02 = Authenticated Key)
  // [3..18] Salt (16 bytes)
  // [19..30] IV (12 bytes)
  // [31..] Ciphertext + 16-byte Auth Tag
  const totalLength = 3 + 16 + 12 + cipherBytes.length;
  const payload = new Uint8Array(totalLength);
  payload[0] = MAGIC_0;
  payload[1] = MAGIC_V3;
  payload[2] = MODE_KEY;
  payload.set(salt, 3);
  payload.set(iv, 19);
  payload.set(cipherBytes, 31);

  // Convert payload bytes to Unicode Variation Selectors
  let encoded = carrier;
  for (let i = 0; i < payload.length; i++) {
    const vs = toVariationSelector(payload[i]);
    if (vs !== null) {
      encoded += vs;
    }
  }

  return encoded;
}

export interface DecodeOptions {
  password?: string;
  vaultKey?: string;
}

/**
 * Extracts variation selectors from `input`, checks for encryption headers,
 * and decrypts the ciphertext using AES-256-GCM.
 * Supports Version 3 (Padded), Version 2 (Unpadded), and Version 1 (Legacy unencrypted fallback).
 */
export async function decode(
  input: string,
  options: DecodeOptions = {}
): Promise<DecryptResult> {
  if (!input || input.length === 0) {
    return { status: "error", error: "Bitte ein Emoji oder Text eingeben." };
  }

  const chars = Array.from(input);
  const carrierChars: string[] = [];
  const extractedBytes: number[] = [];

  for (const char of chars) {
    const cp = char.codePointAt(0);
    if (cp !== undefined) {
      const b = fromVariationSelector(cp);
      if (b !== null) {
        extractedBytes.push(b);
      } else {
        carrierChars.push(char);
      }
    }
  }

  if (extractedBytes.length === 0) {
    return {
      status: "error",
      error: "Keine versteckte Nachricht in diesem Text oder Emoji gefunden.",
    };
  }

  // Scan for magic sequence [0xEE, 0x02] (V2) or [0xEE, 0x03] (V3)
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

  // Determine accurate carrier emoji right before the magic variation selector sequence
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

  // If no magic header is found, attempt legacy unencrypted fallback (original emoji-encoder format)
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

  // Minimum size: 3 (header) + 16 (salt) + 12 (iv) + 16 (auth tag) = 47 bytes
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

  // Candidate keys: explicit password first, then locally stored vaultKey
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

/**
 * Calculates Password Entropy in Bits.
 */
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

/**
 * Inspection helper for the AI-Proof Security Inspector
 */
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
      summaryForAi: "Keine versteckten Variation Selectors gefunden.",
      isPadded: false,
    };
  }

  // Calculate Shannon entropy
  const freq = new Array(256).fill(0);
  for (const b of bytes) freq[b]++;
  let entropy = 0;
  for (const f of freq) {
    if (f > 0) {
      const p = f / bytes.length;
      entropy -= p * Math.log2(p);
    }
  }

  // Check magic bytes
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
    }). Die Rohdaten besitzen eine Entropie von ${entropy.toFixed(
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
