import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { AppText, Badge, Button, Card, IconButton, type BadgeTone } from '@/ui';
import type { ProductRecord } from '../types';

type Props = {
  product: ProductRecord;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ProductCard({ product, onPress, onEdit, onDelete }: Props) {
  const { colors, spacing, radius } = useTheme();

  const isOutOfStock = product.soluong === 0;
  const isLowStock = product.soluong > 0 && product.soluong <= 5;

  const stockBadgeTone: BadgeTone = isOutOfStock ? 'danger' : isLowStock ? 'accent' : 'success';
  const stockBadgeLabel = isOutOfStock
    ? 'Hết hàng (0)'
    : isLowStock
      ? `Sắp hết (${product.soluong})`
      : `Còn ${product.soluong} sp`;

  return (
    <Card padded={false} style={styles.card}>
      <Pressable onPress={onPress} style={styles.pressable}>
        <View style={[styles.imageContainer, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
              <AppText variant="caption" tone="muted" style={{ marginTop: 4 }}>
                Chưa có ảnh
              </AppText>
            </View>
          )}

          <View style={styles.badgeWrapper}>
            <Badge label={stockBadgeLabel} tone={stockBadgeTone} />
          </View>
        </View>

        <View style={[styles.content, { padding: spacing.md }]}>
          <AppText variant="subheading" numberOfLines={2}>
            {product.name}
          </AppText>

          <View style={{ marginTop: 4, marginBottom: 8 }}>
            <AppText variant="price" tone="primary">
              {product.price.toLocaleString('vi-VN')} đ
            </AppText>
          </View>

          <View style={[styles.actions, { borderTopColor: colors.border, paddingTop: spacing.xs }]}>
            <Button
              label="Chi tiết"
              variant="secondary"
              size="sm"
              onPress={onPress}
              style={{ flex: 1, marginRight: spacing.xs }}
            />
            <IconButton
              icon={<Ionicons name="pencil-outline" size={18} color={colors.primary} />}
              accessibilityLabel="Sửa sản phẩm"
              onPress={onEdit}
            />
            <IconButton
              icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />}
              accessibilityLabel="Xóa sản phẩm"
              onPress={onDelete}
            />
          </View>
        </View>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  pressable: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 170,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  content: {
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});