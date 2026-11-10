import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AdminShell } from '@/features/products/components/AdminShell';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useProduct } from '@/features/products/hooks/useProduct';
import { updateProduct } from '@/features/products/productService';
import type { CreateProductInput } from '@/features/products/types';
import { ErrorState, LoadingView, Screen } from '@/ui';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { product, loading, error, reload } = useProduct(id);

  if (loading) {
    return (
      <Screen>
        <LoadingView fullScreen label="Đang tải dữ liệu sản phẩm để sửa…" />
      </Screen>
    );
  }

  if (error || !product) {
    return (
      <Screen>
        <ErrorState message={error?.message || 'Không tìm thấy sản phẩm.'} onRetry={reload} />
      </Screen>
    );
  }

  const handleUpdate = async (values: CreateProductInput) => {
    await updateProduct(product.id, values);
    router.replace(`/products/${product.id}` as any);
  };

  return (
    <AdminShell
      title="Chỉnh sửa Sản phẩm"
      subtitle={`Đang hiệu chỉnh: ${product.name}`}
      showBack
      onBack={() => router.replace(`/products/${product.id}` as any)}
    >
      <ProductForm
        initialValues={product}
        onSubmit={handleUpdate}
        submitLabel="Lưu thay đổi"
      />
    </AdminShell>
  );
}
