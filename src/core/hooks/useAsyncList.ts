import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { toAppError } from '../errors';
import type { AppError } from '../errors';

export type AsyncListState<T> = {
  status: 'loading' | 'ready' | 'error';
  items: T[];
  error: AppError | null;
};

export type AsyncList<T> = {
  state: AsyncListState<T>;
  reload: () => void;
  refresh: () => void;
  refreshing: boolean;
};

export function useAsyncList<T>(fetchItems: () => Promise<T[]>): AsyncList<T> {
  const [state, setState] = useState<AsyncListState<T>>({ status: 'loading', items: [], error: null });
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      fetchItems()
        .then((items) => {
          if (active) setState({ status: 'ready', items, error: null });
        })
        .catch((error: unknown) => {
          if (active) setState({ status: 'error', items: [], error: toAppError(error, 'storage') });
        });

      return () => {
        active = false;
      };
    }, [fetchItems]),
  );

  const reload = useCallback(() => {
    setState({ status: 'loading', items: [], error: null });
    fetchItems()
      .then((items) => setState({ status: 'ready', items, error: null }))
      .catch((error: unknown) =>
        setState({ status: 'error', items: [], error: toAppError(error, 'storage') }),
      );
  }, [fetchItems]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchItems()
      .then((items) => setState({ status: 'ready', items, error: null }))
      .catch((error: unknown) =>
        setState({ status: 'error', items: [], error: toAppError(error, 'storage') }),
      )
      .finally(() => setRefreshing(false));
  }, [fetchItems]);

  return { state, reload, refresh, refreshing };
}
