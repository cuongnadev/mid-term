import type { ThemeMode } from '@/theme';

export type ViewMode = 'grid' | 'list';

export type Preferences = {
  theme: ThemeMode;
  viewMode: ViewMode;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  viewMode: 'grid',
};

export const PREFERENCE_KEYS = {
  theme: 'theme',
  viewMode: 'viewMode',
} as const;

export function parseThemeMode(value: string | null | undefined): ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system' ? value : DEFAULT_PREFERENCES.theme;
}

export function parseViewMode(value: string | null | undefined): ViewMode {
  return value === 'list' || value === 'grid' ? value : DEFAULT_PREFERENCES.viewMode;
}

export function decodePreferences(rows: readonly { key: string; value: string }[]): Preferences {
  let theme = DEFAULT_PREFERENCES.theme;
  let viewMode = DEFAULT_PREFERENCES.viewMode;

  for (const row of rows) {
    if (row.key === PREFERENCE_KEYS.theme) theme = parseThemeMode(row.value);
    else if (row.key === PREFERENCE_KEYS.viewMode) viewMode = parseViewMode(row.value);
  }

  return { theme, viewMode };
}

export function encodePreference(key: keyof Preferences, value: Preferences[keyof Preferences]): string {
  return key === PREFERENCE_KEYS.theme ? parseThemeMode(value) : parseViewMode(value);
}
