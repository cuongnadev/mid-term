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
import { AUTH_STORAGE_KEY, isAdminEmail } from '@/core/config/appConfig';
import {
  createUser,
  getUserById,
  login as loginWithService,
} from '@/features/users/userService';
import {
  toPublicUser,
  type CreateUserInput,
  type PublicUser,
  type UserRecord,
} from '@/features/users/types';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'signed_out'; user: null }
  | { status: 'signed_in'; user: PublicUser };

type AuthContextValue = {
  status: AuthState['status'];
  user: PublicUser | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (input: CreateUserInput) => Promise<PublicUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<PublicUser | null>;
  syncCurrentUser: (updated: UserRecord | PublicUser) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseStoredSession(raw: string | null): PublicUser | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const record = parsed as Record<string, unknown>;
    const id = typeof record.id === 'string' ? record.id : '';
    const email = typeof record.email === 'string' ? record.email : '';
    const hoten = typeof record.hoten === 'string' ? record.hoten : '';
    const hinhanh = typeof record.hinhanh === 'string' ? record.hinhanh : '';

    if (!id || !email) return null;
    return { id, email, hoten, hinhanh };
  } catch {
    return null;
  }
}

async function persistSession(user: PublicUser): Promise<void> {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

async function clearPersistedSession(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const stored = parseStoredSession(raw);
        if (!stored) {
          if (active) setState({ status: 'signed_out', user: null });
          return;
        }

        try {
          const fresh = await getUserById(stored.id);
          if (!fresh) {
            await clearPersistedSession();
            if (active) setState({ status: 'signed_out', user: null });
            return;
          }

          const publicUser = toPublicUser(fresh);
          await persistSession(publicUser);
          if (active) setState({ status: 'signed_in', user: publicUser });
        } catch {
          if (active) setState({ status: 'signed_in', user: stored });
        }
      } catch {
        if (active) setState({ status: 'signed_out', user: null });
      }
    };

    void restore();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<PublicUser> => {
    const userRecord = await loginWithService(email, password);
    const publicUser = toPublicUser(userRecord);
    await persistSession(publicUser);
    setState({ status: 'signed_in', user: publicUser });
    return publicUser;
  }, []);

  const register = useCallback(async (input: CreateUserInput): Promise<PublicUser> => {
    const userRecord = await createUser(input);
    const publicUser = toPublicUser(userRecord);
    await persistSession(publicUser);
    setState({ status: 'signed_in', user: publicUser });
    return publicUser;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await clearPersistedSession();
    setState({ status: 'signed_out', user: null });
  }, []);

  const refreshSession = useCallback(async (): Promise<PublicUser | null> => {
    if (state.status !== 'signed_in') return null;

    const fresh = await getUserById(state.user.id);
    if (!fresh) {
      await clearPersistedSession();
      setState({ status: 'signed_out', user: null });
      return null;
    }

    const publicUser = toPublicUser(fresh);
    await persistSession(publicUser);
    setState({ status: 'signed_in', user: publicUser });
    return publicUser;
  }, [state]);

  const syncCurrentUser = useCallback(
    async (updated: UserRecord | PublicUser): Promise<void> => {
      const publicUser: PublicUser = {
        id: updated.id,
        email: updated.email,
        hoten: updated.hoten,
        hinhanh: updated.hinhanh,
      };
      if (state.status === 'signed_in' && state.user.id === publicUser.id) {
        await persistSession(publicUser);
        setState({ status: 'signed_in', user: publicUser });
      }
    },
    [state],
  );

  const isAdmin = state.status === 'signed_in' && isAdminEmail(state.user.email);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: state.status,
      user: state.user,
      isAdmin,
      login,
      register,
      logout,
      refreshSession,
      syncCurrentUser,
    }),
    [state.status, state.user, isAdmin, login, register, logout, refreshSession, syncCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth() phải được dùng bên trong <AuthProvider>.');
  }
  return value;
}