import { useMemo } from 'react';
import { isAdminEmail } from '@/core/config/appConfig';
import { useAsyncList } from '@/core/hooks/useAsyncList';
import { matchesQuery } from '@/core/utils';
import { getUsers } from '../userService';
import type { UserRecord } from '../types';

export type UserListFilter = 'all' | 'with_avatar' | 'without_avatar' | 'admin';

type UseUsersParams = {
  search: string;
  filter: UserListFilter;
  aiMatchedIds: readonly string[] | null;
};

export function useUsers({ search, filter, aiMatchedIds }: UseUsersParams) {
  const list = useAsyncList<UserRecord>(getUsers);

  const filteredItems = useMemo(() => {
    let result = list.state.items;

    if (aiMatchedIds !== null) {
      const idSet = new Set(aiMatchedIds);
      result = result.filter((user) => idSet.has(user.id));
    } else if (filter === 'with_avatar') {
      result = result.filter((user) => user.hinhanh.trim().length > 0);
    } else if (filter === 'without_avatar') {
      result = result.filter((user) => user.hinhanh.trim().length === 0);
    } else if (filter === 'admin') {
      result = result.filter((user) => isAdminEmail(user.email));
    }

    const trimmed = search.trim();
    if (!trimmed) return result;

    return result.filter((user) => matchesQuery(`${user.hoten} ${user.email}`, trimmed));
  }, [aiMatchedIds, filter, list.state.items, search]);

  return {
    state: {
      ...list.state,
      items: filteredItems,
    },
    allUsers: list.state.items,
    totalCount: list.state.items.length,
    reload: list.reload,
    refresh: list.refresh,
    refreshing: list.refreshing,
  };
}