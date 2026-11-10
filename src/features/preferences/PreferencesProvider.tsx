import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREFERENCES_STORAGE_KEY } from '@/core/config/appConfig';
import type { ThemeMode } from '@/theme';
import {
  DEFAULT_PREFERENCES,
  parseThemeMode,
  parseViewMode,
  type Preferences,
  type ViewMode,
} from './preferencesCodec';

type PreferencesContextValue = {
  theme: ThemeMode;
  viewMode: ViewMode;
  ready: boolean;
  setTheme: (mode: ThemeMode) => void;
  setViewMode: (mode: ViewMode) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type State = Preferences & { ready: boolean };

const INITIAL_STATE: State = {
  theme: DEFAULT_PREFERENCES.theme,
  viewMode: DEFAULT_PREFERENCES.viewMode,
  ready: false,
};

function parseStoredPreferences(raw: string | null): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PREFERENCES;

    const record = parsed as Record<string, unknown>;
    const rawTheme = typeof record.theme === 'string' ? record.theme : undefined;
    const rawViewMode = typeof record.viewMode === 'string' ? record.viewMode : undefined;

    return {
      theme: parseThemeMode(rawTheme),
      viewMode: parseViewMode(rawViewMode),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INITIAL_STATE);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(PREFERENCES_STORAGE_KEY)
      .then((raw) => {
        const prefs = parseStoredPreferences(raw);
        if (active) {
          setState({ theme: prefs.theme, viewMode: prefs.viewMode, ready: true });
        }
      })
      .catch(() => {
        if (active) {
          setState((current) => ({ ...current, ready: true }));
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      if (state.theme === next) return;
      const previous = state.theme;
      const nextPrefs: Preferences = { theme: next, viewMode: state.viewMode };

      setState({ ...nextPrefs, ready: true });
      AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(nextPrefs)).catch(() => {
        setState((current) => ({ ...current, theme: previous }));
      });
    },
    [state.theme, state.viewMode],
  );

  const setViewMode = useCallback(
    (next: ViewMode) => {
      if (state.viewMode === next) return;
      const previous = state.viewMode;
      const nextPrefs: Preferences = { theme: state.theme, viewMode: next };

      setState({ ...nextPrefs, ready: true });
      AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(nextPrefs)).catch(() => {
        setState((current) => ({ ...current, viewMode: previous }));
      });
    },
    [state.theme, state.viewMode],
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      theme: state.theme,
      viewMode: state.viewMode,
      ready: state.ready,
      setTheme,
      setViewMode,
    }),
    [state.theme, state.viewMode, state.ready, setTheme, setViewMode],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const value = useContext(PreferencesContext);
  if (!value) {
    throw new Error('usePreferences() phải được dùng bên trong <PreferencesProvider>.');
  }
  return value;
}