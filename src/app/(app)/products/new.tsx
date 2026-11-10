import React from 'react';
import { useRouter } from 'expo-router';
import { AdminShell } from '@/features/products/components/AdminShell';
import { ProductForm } from '@/features/products/components/ProductForm';
import { createProduct } from '@/features/products/productService';
import type { CreateProductInput } from '@/features/products/types';

export default function NewProductScreen() {
  const router = useRouter();

  const handleCreate = async (values: CreateProductInput) => {
    await createProduct(values);
    router.replace('/products' as any);
  };

  return (
    <AdminShell
      title="Thêm Sản phẩm Mới"
      subtitle="Nhập kho dữ liệu trực tiếp vào Firestore collection products"
      showBack
      onBack={() => router.replace('/products' as any)}
    >
      <ProductForm onSubmit={handleCreate} submitLabel="Tạo sản phẩm" />
    </AdminShell>
  );
}