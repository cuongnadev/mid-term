export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;
export type PasswordStrengthTone = 'danger' | 'accent' | 'primary' | 'success';

export type PasswordCriteria = {
  minLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
};

export type PasswordStrengthResult = {
  score: PasswordStrengthLevel;
  label: string;
  tone: PasswordStrengthTone;
  checks: PasswordCriteria;
};

const LOWER_CHARS = 'abcdefghijkmnopqrstuvwxyz';
const UPPER_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGIT_CHARS = '23456789';
const SPECIAL_CHARS = '!@#$%&*?';
const ALL_CHARS = `${LOWER_CHARS}${UPPER_CHARS}${DIGIT_CHARS}${SPECIAL_CHARS}`;

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks: PasswordCriteria = {
    minLength: password.length >= 6,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  if (!password) {
    return { score: 0, label: 'Chưa nhập', tone: 'danger', checks };
  }

  let points = 0;
  if (checks.minLength) points += 1;
  if (password.length >= 10) points += 1;
  if (checks.hasLower && checks.hasUpper) points += 1;
  if (checks.hasNumber) points += 1;
  if (checks.hasSpecial) points += 1;

  if (!checks.minLength || points <= 1) {
    return { score: 1, label: 'Yếu', tone: 'danger', checks };
  }
  if (points === 2) {
    return { score: 2, label: 'Trung bình', tone: 'accent', checks };
  }
  if (points === 3 || points === 4) {
    return { score: 3, label: 'Khá mạnh', tone: 'primary', checks };
  }
  return { score: 4, label: 'Rất mạnh', tone: 'success', checks };
}

function randomCharFrom(pool: string, byte: number): string {
  return pool[byte % pool.length] ?? pool[0] ?? 'A';
}

function getRandomBytes(length: number): Uint8Array {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Crypto = require('expo-crypto');
    if (Crypto?.getRandomBytes) {
      return Crypto.getRandomBytes(length);
    }
  } catch {
    // Fallback if native module is unavailable
  }

  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function generateCryptoStrongPassword(length = 12): string {
  const safeLength = Math.max(8, length);
  const bytes = getRandomBytes(safeLength * 2);

  const chars: string[] = [
    randomCharFrom(UPPER_CHARS, bytes[0] ?? 1),
    randomCharFrom(LOWER_CHARS, bytes[1] ?? 2),
    randomCharFrom(DIGIT_CHARS, bytes[2] ?? 3),
    randomCharFrom(SPECIAL_CHARS, bytes[3] ?? 4),
  ];

  for (let i = chars.length; i < safeLength; i += 1) {
    const byte = bytes[i] ?? i * 7;
    chars.push(randomCharFrom(ALL_CHARS, byte));
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const byte = bytes[safeLength + i] ?? i * 13;
    const j = byte % (i + 1);
    const current = chars[i] ?? '';
    chars[i] = chars[j] ?? current;
    chars[j] = current;
  }

  return chars.join('');
}
