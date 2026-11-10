import { useMemo, useState } from 'react';
import { useAsyncList } from '@/core/hooks/useAsyncList';
import { matchesQuery } from '@/core/utils';
import { getProducts } from '../productService';
import type { ProductFilterState, ProductRecord } from '../types';

export function useProducts() {
  const list = useAsyncList<ProductRecord>(getProducts);

  const [filters, setFilters] = useState<ProductFilterState>({
    searchQuery: '',
    stockFilter: 'all',
    priceFilter: 'all',
    sortBy: 'newest',
  });

  const filteredProducts = useMemo(() => {
    let result = list.state.items;

    const q = filters.searchQuery.trim();
    if (q) {
      result = result.filter((p) => matchesQuery(p.name, q));
    }

    if (filters.stockFilter === 'in_stock') {
      result = result.filter((p) => p.soluong > 0);
    } else if (filters.stockFilter === 'low_stock') {
      result = result.filter((p) => p.soluong > 0 && p.soluong <= 5);
    } else if (filters.stockFilter === 'out_of_stock') {
      result = result.filter((p) => p.soluong === 0);
    }

    if (filters.priceFilter === 'under_100k') {
      result = result.filter((p) => p.price < 100000);
    } else if (filters.priceFilter === '100k_500k') {
      result = result.filter((p) => p.price >= 100000 && p.price <= 500000);
    } else if (filters.priceFilter === '500k_2m') {
      result = result.filter((p) => p.price > 500000 && p.price <= 2000000);
    } else if (filters.priceFilter === 'over_2m') {
      result = result.filter((p) => p.price > 2000000);
    }

    const sorted = [...result];
    sorted.sort((a, b) => {
      if (filters.sortBy === 'name_asc') return a.name.localeCompare(b.name, 'vi');
      if (filters.sortBy === 'name_desc') return b.name.localeCompare(a.name, 'vi');
      if (filters.sortBy === 'price_asc') return a.price - b.price;
      if (filters.sortBy === 'price_desc') return b.price - a.price;
      if (filters.sortBy === 'stock_asc') return a.soluong - b.soluong;
      if (filters.sortBy === 'stock_desc') return b.soluong - a.soluong;
      return 0;
    });

    return sorted;
  }, [list.state.items, filters]);

  return {
    products: filteredProducts,
    allProducts: list.state.items,
    loading: list.state.status === 'loading',
    error: list.state.error,
    refreshing: list.refreshing,
    filters,
    setFilters,
    reload: list.reload,
    refresh: list.refresh,
  };
}