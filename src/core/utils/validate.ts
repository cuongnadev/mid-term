const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_NAME_LENGTH = 100;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(normalizeEmail(email));
}

export function validateEmail(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return 'Vui lòng nhập email.';
  if (!isValidEmail(normalized)) return 'Email không đúng định dạng.';
  return null;
}

export function validatePassword(
  password: string,
  options: { required?: boolean } = {},
): string | null {
  const required = options.required ?? true;
  if (!password) {
    return required ? 'Vui lòng nhập mật khẩu.' : null;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
  }
  return null;
}

export function validateFullName(hoten: string): string | null {
  const trimmed = hoten.trim();
  if (!trimmed) return 'Vui lòng nhập họ tên.';
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Họ tên không được vượt quá ${MAX_NAME_LENGTH} ký tự.`;
  }
  return null;
}