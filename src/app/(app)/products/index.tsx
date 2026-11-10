import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { alertDialog, confirmDialog } from '@/core/utils';
import { AdminShell } from '@/features/products/components/AdminShell';
import { ProductCard } from '@/features/products/components/ProductCard';
import { ProductDashboard } from '@/features/products/components/ProductDashboard';
import { ProductSearchBar } from '@/features/products/components/ProductSearchBar';
import { ProductWebTable } from '@/features/products/components/ProductWebTable';
import { useProducts } from '@/features/products/hooks/useProducts';
import { deleteProduct, exportProductsToJsonString } from '@/features/products/productService';
import type { ProductRecord } from '@/features/products/types';
import { useTheme } from '@/theme';
import {
  Button,
  EmptyState,
  ErrorState,
  Fab,
  IconButton,
  ImageViewer,
  LoadingView,
  Screen,
} from '@/ui';

export default function ProductsListScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const {
    products,
    allProducts,
    loading,
    refreshing,
    error,
    filters,
    setFilters,
    reload,
    refresh,
  } = useProducts();

  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  const isWebOrWide = Platform.OS === 'web' && width >= 860;

  const handleDelete = async (p: ProductRecord) => {
    const ok = await confirmDialog({
      title: 'Xóa sản phẩm',
      message: `Bạn có chắc muốn xóa "${p.name}"? Thao tác này sẽ xóa vĩnh viễn khỏi Firestore.`,
      confirmLabel: 'Xóa ngay',
      destructive: true,
    });
    if (!ok) return;

    await deleteProduct(p.id);
    refresh();
  };

  const handleExportJson = () => {
    const jsonStr = exportProductsToJsonString(allProducts);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      void alertDialog(
        'Xuất CSDL',
        `Đã xuất ${allProducts.length} sản phẩm ra định dạng products.json.`,
      );
    }
  };

  if (loading && !refreshing) {
    return (
      <Screen>
        <LoadingView fullScreen label="Đang tải danh sách sản phẩm từ Firestore…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorState message={error.message} onRetry={reload} />
      </Screen>
    );
  }

  return (
    <AdminShell
      title="Quản lý Sản phẩm"
      subtitle="Firestore products (4 trường)"
      actions={
        isWebOrWide ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Button
              label="📥 Xuất CSDL (.json)"
              variant="secondary"
              size="sm"
              onPress={handleExportJson}
            />
            <Button
              label="➕ Thêm mới"
              variant="primary"
              size="sm"
              onPress={() => router.push('/products/new' as any)}
            />
          </View>
        ) : (
          <IconButton
            icon={<Ionicons name="download-outline" size={20} color={colors.primary} />}
            accessibilityLabel="Xuất CSDL"
            onPress={handleExportJson}
          />
        )
      }
    >
      {isWebOrWide ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
        >
          <ProductDashboard products={allProducts} />
          <ProductSearchBar filters={filters} onChange={setFilters} />

          {products.length > 0 ? (
            <ProductWebTable
              products={products}
              onView={(p) => router.push(`/products/${p.id}` as any)}
              onEdit={(p) => router.push(`/products/${p.id}/edit` as any)}
              onDelete={handleDelete}
              onPreviewImage={(uri) => setPreviewImageUri(uri)}
            />
          ) : (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              message="Thử thay đổi bộ lọc hoặc bấm 'Thêm sản phẩm mới' để nhập kho."
              actionLabel="Thêm sản phẩm mới"
              onAction={() => router.push('/products/new' as any)}
            />
          )}
        </ScrollView>
      ) : (
        <View style={styles.mobileContainer}>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={refresh}
            ListHeaderComponent={
              <View style={{ padding: spacing.md }}>
                <ProductDashboard products={allProducts} />
                <ProductSearchBar filters={filters} onChange={setFilters} />
              </View>
            }
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: spacing.md }}>
                <ProductCard
                  product={item}
                  onPress={() => router.push(`/products/${item.id}` as any)}
                  onEdit={() => router.push(`/products/${item.id}/edit` as any)}
                  onDelete={() => handleDelete(item)}
                />
              </View>
            )}
            ListEmptyComponent={
              <EmptyState
                title="Không tìm thấy sản phẩm"
                message="Thử thay đổi bộ lọc hoặc bấm 'Thêm sản phẩm mới' để nhập kho."
                actionLabel="Thêm sản phẩm mới"
                onAction={() => router.push('/products/new' as any)}
              />
            }
            contentContainerStyle={{ paddingBottom: spacing.xxl + 80 }}
          />

          <Fab
            label="Thêm mới"
            icon={<Ionicons name="add" size={24} color={colors.onAccent} />}
            onPress={() => router.push('/products/new' as any)}
          />
        </View>
      )}

      {previewImageUri ? (
        <ImageViewer
          visible={Boolean(previewImageUri)}
          uri={previewImageUri}
          onClose={() => setPreviewImageUri(null)}
        />
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    maxWidth: 1300,
    width: '100%',
    alignSelf: 'center',
  },
  mobileContainer: {
    flex: 1,
  },
});
