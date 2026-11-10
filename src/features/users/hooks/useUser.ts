import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { toAppError, type AppError } from '@/core/errors';
import { getUserById } from '../userService';
import type { UserRecord } from '../types';

export type UserDetailState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; user: UserRecord };

export function useUser(userId: string) {
  const [state, setState] = useState<UserDetailState>({ status: 'loading' });

  const fetchUser = useCallback(async (): Promise<UserDetailState> => {
    if (!userId.trim()) {
      return { status: 'missing' };
    }
    const found = await getUserById(userId);
    if (!found) return { status: 'missing' };
    return { status: 'ready', user: found };
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      fetchUser()
        .then((nextState) => {
          if (active) setState(nextState);
        })
        .catch((error: unknown) => {
          if (active) setState({ status: 'error', error: toAppError(error, 'storage') });
        });

      return () => {
        active = false;
      };
    }, [fetchUser]),
  );

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    fetchUser()
      .then((nextState) => setState(nextState))
      .catch((error: unknown) =>
        setState({ status: 'error', error: toAppError(error, 'storage') }),
      );
  }, [fetchUser]);

  return { state, reload };
}