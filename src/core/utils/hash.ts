import { PEPPER } from '@/core/config/appConfig';

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function jsSha256(ascii: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0;
  let j = 0;
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, number> = {};

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  let formatted = ascii + '\x80';
  while (formatted.length % 64 !== 56) {
    formatted += '\x00';
  }

  for (i = 0; i < formatted.length; i++) {
    j = formatted.charCodeAt(i);
    words[i >> 2] = (words[i >> 2] ?? 0) | (j << ((3 - (i % 4)) * 8));
  }

  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength | 0;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = [...hash];

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15] ?? 0;
      const w2 = w[i - 2] ?? 0;
      const a = hash[0] ?? 0;
      const e = hash[4] ?? 0;
      const temp1 =
        ((hash[7] ?? 0) +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & (hash[5] ?? 0)) ^ (~e & (hash[6] ?? 0))) +
          (k[i] ?? 0) +
          ((w[i] =
            i < 16
              ? (w[i] ?? 0)
              : ((w[i - 16] ?? 0) +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  (w[i - 7] ?? 0) +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0) |
            0)) |
        0;

      const temp2 =
        ((rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & (hash[1] ?? 0)) ^ (a & (hash[2] ?? 0)) ^ ((hash[1] ?? 0) & (hash[2] ?? 0)))) |
        0;

      hash[7] = hash[6] ?? 0;
      hash[6] = hash[5] ?? 0;
      hash[5] = hash[4] ?? 0;
      hash[4] = ((hash[3] ?? 0) + temp1) | 0;
      hash[3] = hash[2] ?? 0;
      hash[2] = hash[1] ?? 0;
      hash[1] = hash[0] ?? 0;
      hash[0] = (temp1 + temp2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = ((hash[i] ?? 0) + (oldHash[i] ?? 0)) | 0;
    }
  }

  return hash.map((h) => ('0000000' + (h >>> 0).toString(16)).slice(-8)).join('');
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const payload = `${PEPPER}:${plainPassword}`;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Crypto = require('expo-crypto');
    if (Crypto?.digestStringAsync) {
      return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, payload);
    }
  } catch {
    // Native module unavailable, use pure JS fallback
  }

  return jsSha256(payload);
}

export async function verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  if (plainPassword === storedHash) return true;
  const computed = await hashPassword(plainPassword);
  return computed === storedHash;
}
