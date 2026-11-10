import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { createTheme, type Theme, type ThemeMode } from './tokens';

export type ThemeContextValue = Theme & {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = {
  children: ReactNode;
  initialMode?: ThemeMode;
  mode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
};

export function ThemeProvider({ children, initialMode = 'system', mode: controlledMode, onModeChange }: Props) {
  const systemScheme = useColorScheme();
  const [internalMode, setInternalMode] = useState<ThemeMode>(initialMode);

  const mode = controlledMode ?? internalMode;

  const setMode = useCallback(
    (next: ThemeMode) => {
      setInternalMode(next);
      onModeChange?.(next);
    },
    [onModeChange],
  );

  const scheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({ ...createTheme(scheme), mode, setMode }),
    [scheme, mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
