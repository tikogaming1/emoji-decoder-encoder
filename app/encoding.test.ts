import { expect, test, describe } from 'vitest'
import {
  encode,
  decode,
  toVariationSelector,
  fromVariationSelector,
  inspectEmojiString,
  calculatePasswordEntropy,
  deriveKey,
  MAGIC_0,
  MAGIC_V2,
  MODE_KEY,
} from './encoding'
import { EMOJI_LIST } from './emoji'

describe('Crypto Emoji Encoder / Decoder', () => {
  test('Password-protected encryption: correctly encodes and decodes text', async () => {
    const password = 'SuperSecretPassphrase!2026'
    const testStrings = [
      'Hello, World!',
      'Streng geheime Nachricht für Agent Mode',
      'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      'German umlauts: Äöüß und Großbuchstaben ÄÖÜ',
      'Unicode text: 你好，世界 🌍 🚀 🔒',
    ]

    for (const str of testStrings) {
      const encoded = await encode('🔒', str, { password })
      const result = await decode(encoded, { password })

      expect(result.status).toBe('success')
      if (result.status === 'success') {
        expect(result.text).toBe(str)
        expect(result.mode).toBe('password')
        expect(result.hiddenByteCount).toBeGreaterThan(47)
      }
    }
  })

  test('Requires password or vault key to encode', async () => {
    await expect(encode('🔒', 'Secret message', {})).rejects.toThrow(
      'Ein Passwort oder Tresor-Schlüssel ist erforderlich.'
    )
  })

  test('Decoding without password prompts for password', async () => {
    const password = 'MyPassword123!'
    const encoded = await encode('🤫', 'Top Secret', { password })

    const resultNoKey = await decode(encoded, {})
    expect(resultNoKey.status).toBe('needs_password')

    const resultWrongKey = await decode(encoded, { password: 'wrong' })
    expect(resultWrongKey.status).toBe('invalid_password')

    const resultRightKey = await decode(encoded, { password })
    expect(resultRightKey.status).toBe('success')
    if (resultRightKey.status === 'success') {
      expect(resultRightKey.text).toBe('Top Secret')
    }
  })

  test('Private Vault Key works seamlessly for group members', async () => {
    const vaultKey = 'PrivateTeamKey#2026'
    const message = 'Vertrauliche Team-Nachricht'

    const encoded = await encode('🔑', message, { vaultKey })

    // Stranger with no vault key cannot decode
    const decStranger = await decode(encoded, {})
    expect(decStranger.status).toBe('needs_password')

    // Team member with matching vault key decodes automatically
    const decMember = await decode(encoded, { vaultKey })
    expect(decMember.status).toBe('success')
    if (decMember.status === 'success') {
      expect(decMember.text).toBe(message)
      expect(decMember.mode).toBe('vault_key')
    }
  })

  test('Length Leakage Protection: Padding hides actual text size', async () => {
    const password = 'SafePassword'
    const shortMsg = 'Hi'
    const longMsg = 'This is a much longer secret message text.'

    const encShort = await encode('🔒', shortMsg, { password })
    const encLong = await encode('🔒', longMsg, { password })

    // In V3, both fit into 64-byte block, so their variation selector count is identical!
    expect(Array.from(encShort).length).toBe(Array.from(encLong).length)

    const decShort = await decode(encShort, { password })
    const decLong = await decode(encLong, { password })

    expect(decShort.status).toBe('success')
    expect(decLong.status).toBe('success')
    if (decShort.status === 'success' && decLong.status === 'success') {
      expect(decShort.text).toBe(shortMsg)
      expect(decLong.text).toBe(longMsg)
    }
  })

  test('Works with emojis that already contain variation selectors (e.g. ❤️ and ⚠️)', async () => {
    const password = 'Key'
    const complexEmojis = ['❤️', '⚠️']
    const text = 'Geheimnis hinter Herz-Emoji'

    for (const emoji of complexEmojis) {
      const encoded = await encode(emoji, text, { password })
      const result = await decode(encoded, { password })

      expect(result.status).toBe('success')
      if (result.status === 'success') {
        expect(result.text).toBe(text)
      }
    }
  })

  test('Fresh random Salt and IV on each encode (non-deterministic ciphertext)', async () => {
    const password = 'Key'
    const emoji = '🔒'
    const message = 'Same message twice'

    const enc1 = await encode(emoji, message, { password })
    const enc2 = await encode(emoji, message, { password })

    expect(enc1).not.toBe(enc2)

    const dec1 = await decode(enc1, { password })
    const dec2 = await decode(enc2, { password })

    expect(dec1.status).toBe('success')
    expect(dec2.status).toBe('success')
    if (dec1.status === 'success' && dec2.status === 'success') {
      expect(dec1.text).toBe(message)
      expect(dec2.text).toBe(message)
    }
  })

  test('Detects tamper / corruption via AES-GCM authentication tag', async () => {
    const password = 'Key'
    const encoded = await encode('🔒', 'Unveränderliche Botschaft', { password })
    const chars = Array.from(encoded)

    const lastChar = chars[chars.length - 1]
    const cp = lastChar.codePointAt(0)!
    let tamperedCodePoint: number
    if (cp === 0x200b) tamperedCodePoint = 0x200c
    else if (cp === 0x200c) tamperedCodePoint = 0x200b
    else if (cp === 0x200d) tamperedCodePoint = 0x2060
    else if (cp === 0x2060) tamperedCodePoint = 0x200d
    else tamperedCodePoint = cp === 0xfe01 ? 0xfe02 : 0xfe01
    chars[chars.length - 1] = String.fromCodePoint(tamperedCodePoint)
    const tampered = chars.join('')

    const result = await decode(tampered, { password })
    expect(result.status).toBe('invalid_password')
  })

  test('Password entropy helper correctly grades password strength', () => {
    expect(calculatePasswordEntropy('123456').strengthLabel).toBe('Sehr schwach')
    expect(calculatePasswordEntropy('sommer').strengthLabel).toBe('Schwach')
    expect(calculatePasswordEntropy('sommer2024').strengthLabel).toBe('Mittel')
    expect(calculatePasswordEntropy('Sommer2024!').strengthLabel).toBe('Stark')
    expect(calculatePasswordEntropy('x9#kL2!mP9$wQ7@v').strengthLabel).toBe('Sehr stark')
  })
})
