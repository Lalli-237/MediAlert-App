/**
 * Advanced Local Encryption using native Web Crypto API
 * Algorithm: AES-GCM 256-bit
 * Key Derivation: PBKDF2 with SHA-256, 100,000 iterations, 16-byte random salt, 12-byte IV
 */

const ENC_PREFIX = 'ENC_AES256:';

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(plainText: string, passphrase: string): Promise<string> {
  if (!passphrase) {
    return plainText;
  }
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);

    const enc = new TextEncoder();
    const encodedData = enc.encode(plainText);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedData
    );

    const saltHex = bufferToHex(salt);
    const ivHex = bufferToHex(iv);
    const cipherHex = bufferToHex(encryptedBuffer);

    return `${ENC_PREFIX}${saltHex}:${ivHex}:${cipherHex}`;
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('Encryption operation failed');
  }
}

export async function decryptData(cipherData: string, passphrase: string): Promise<string> {
  if (!cipherData.startsWith(ENC_PREFIX)) {
    // Unencrypted legacy/plain format
    return cipherData;
  }

  if (!passphrase) {
    throw new Error('Passphrase required for encrypted data');
  }

  try {
    const payload = cipherData.substring(ENC_PREFIX.length);
    const parts = payload.split(':');
    if (parts.length !== 3) {
      throw new Error('Malformed encrypted payload');
    }

    const salt = hexToBuffer(parts[0]);
    const iv = hexToBuffer(parts[1]);
    const ciphertext = hexToBuffer(parts[2]);

    const key = await deriveKey(passphrase, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    console.error('Decryption failed:', err);
    throw new Error('Invalid passphrase or corrupted data');
  }
}

export function isEncrypted(data: string): boolean {
  return typeof data === 'string' && data.startsWith(ENC_PREFIX);
}
