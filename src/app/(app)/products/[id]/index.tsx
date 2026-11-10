import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { confirmDialog } from '@/core/utils';
import { AdminShell } from '@/features/products/components/AdminShell';
import { useProduct } from '@/features/products/hooks/useProduct';
import { deleteProduct } from '@/features/products/productService';
import { useTheme } from '@/theme';
import {
  AppText,
  Badge,
  Button,
  Card,
  ErrorState,
  ImageViewer,
  LoadingView,
  Screen,
  type BadgeTone,
} from '@/ui';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { width } = useWindowDimensions();
  const { product, loading, error, reload } = useProduct(id);

  const [viewerVisible, setViewerVisible] = useState(false);
  const isWebWide = Platform.OS === 'web' && width >= 768;

  if (loading) {
    return (
      <Screen>
        <LoadingView fullScreen label="Đang tải chi tiết sản phẩm…" />
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

  const isOutOfStock = product.soluong === 0;
  const isLowStock = product.soluong > 0 && product.soluong <= 5;
  const stockBadgeTone: BadgeTone = isOutOfStock ? 'danger' : isLowStock ? 'accent' : 'success';
  const stockBadgeLabel = isOutOfStock
    ? 'Hết hàng (0)'
    : isLowStock
      ? `Sắp hết hàng (${product.soluong})`
      : `Còn hàng (${product.soluong} sp)`;

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: 'Xóa sản phẩm',
      message: `Bạn có chắc muốn xóa "${product.name}" khỏi cơ sở dữ liệu?`,
      confirmLabel: 'Xóa vĩnh viễn',
      destructive: true,
    });
    if (!ok) return;

    await deleteProduct(product.id);
    router.replace('/products' as any);
  };

  return (
    <AdminShell
      title="Chi tiết Sản phẩm"
      subtitle={`ID: ${product.id}`}
      showBack
      onBack={() => router.replace('/products' as any)}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <View style={isWebWide ? styles.twoColumns : undefined}>
            <View style={isWebWide ? styles.columnLeft : undefined}>
              <View
                style={[
                  styles.imageWrapper,
                  { backgroundColor: colors.surfaceAlt, borderRadius: radius.md },
                ]}
              >
                {product.image ? (
                  <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
                ) : null}
              </View>

              {product.image ? (
                <Button
                  label="🔍 Xem ảnh toàn màn hình"
                  variant="secondary"
                  size="sm"
                  onPress={() => setViewerVisible(true)}
                  style={{ marginTop: spacing.sm }}
                />
              ) : null}
            </View>

            <View style={isWebWide ? styles.columnRight : { marginTop: spacing.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Badge label={stockBadgeLabel} tone={stockBadgeTone} />
                <AppText variant="caption" tone="muted">
                  Collection: products
                </AppText>
              </View>

              <AppText variant="title" style={{ marginTop: spacing.sm }}>
                {product.name}
              </AppText>

              <AppText
                variant="price"
                tone="primary"
                style={{ marginTop: spacing.xs, marginBottom: spacing.md }}
              >
                {product.price.toLocaleString('vi-VN')} đ
              </AppText>

              <View style={[styles.infoRow, { borderColor: colors.border }]}>
                <AppText variant="body">Số lượng tồn kho:</AppText>
                <AppText variant="bodyStrong">{product.soluong} sản phẩm</AppText>
              </View>

              <View style={[styles.infoRow, { borderColor: colors.border }]}>
                <AppText variant="body">Tổng giá trị tồn:</AppText>
                <AppText variant="bodyStrong" tone="primary">
                  {(product.price * product.soluong).toLocaleString('vi-VN')} đ
                </AppText>
              </View>

              <View style={[styles.infoRow, { borderColor: colors.border }]}>
                <AppText variant="body">Mã định danh ID:</AppText>
                <AppText variant="caption" tone="muted">
                  {product.id}
                </AppText>
              </View>

              <View style={styles.actionsRow}>
                <Button
                  label="Chỉnh sửa"
                  variant="primary"
                  onPress={() => router.push(`/products/${product.id}/edit` as any)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  label="Xóa sản phẩm"
                  variant="danger"
                  onPress={handleDelete}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>

      {product.image ? (
        <ImageViewer
          visible={viewerVisible}
          uri={product.image}
          onClose={() => setViewerVisible(false)}
        />
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 24,
  },
  columnLeft: {
    flex: 1.1,
  },
  columnRight: {
    flex: 1,
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 280,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
