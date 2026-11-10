import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { toAppError, type AppError } from '@/core/errors';
import { getProductById } from '../productService';
import type { ProductRecord } from '../types';

export type ProductDetailState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; error: AppError }
  | { status: 'ready'; product: ProductRecord };

export function useProduct(productId: string | undefined) {
  const [state, setState] = useState<ProductDetailState>({ status: 'loading' });

  const fetchProduct = useCallback(async (): Promise<ProductDetailState> => {
    if (!productId || !productId.trim()) {
      return { status: 'missing' };
    }
    try {
      const found = await getProductById(productId);
      return { status: 'ready', product: found };
    } catch (err: unknown) {
      return { status: 'error', error: toAppError(err, 'storage') };
    }
  }, [productId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      fetchProduct().then((nextState) => {
        if (active) setState(nextState);
      });

      return () => {
        active = false;
      };
    }, [fetchProduct]),
  );

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    fetchProduct().then(setState);
  }, [fetchProduct]);

  return {
    state,
    product: state.status === 'ready' ? state.product : null,
    loading: state.status === 'loading',
    error: state.status === 'error' ? state.error : null,
    reload,
  };
}