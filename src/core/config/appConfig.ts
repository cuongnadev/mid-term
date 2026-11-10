export const ADMIN_EMAIL = 'admin@gmail.com';

export const PEPPER = 'midterm-react-native-user-pepper-2026';

export const USERS_COLLECTION = 'users';
export const PRODUCTS_COLLECTION = 'products';

export const AUTH_STORAGE_KEY = '@midterm_auth_session_v1';
export const PREFERENCES_STORAGE_KEY = '@midterm_preferences_v1';

export const MAX_BASE64_IMAGE_BYTES = 700_000;

export const GEMINI_API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '').trim();
export const GEMINI_MODEL = 'gemini-3.8-flash';
export const GEMINI_FALLBACK_MODEL = 'gemini-3.5-flash-lite';
export const GEMINI_SECONDARY_FALLBACK_MODEL = 'gemini-3.5-flash';
export const GEMINI_TIMEOUT_MS = 25_000;

export function hasGeminiApiKey(): boolean {
  return GEMINI_API_KEY.length > 0;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
}