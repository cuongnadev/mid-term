import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { AppText, Button, Card, IconButton } from '@/ui';
import type { ProductRecord } from '../types';

type Props = {
  products: ProductRecord[];
  onView: (p: ProductRecord) => void;
  onEdit: (p: ProductRecord) => void;
  onDelete: (p: ProductRecord) => void;
  onPreviewImage?: (uri: string) => void;
};

export function ProductWebTable({
  products,
  onView,
  onEdit,
  onDelete,
  onPreviewImage,
}: Props) {
  const { colors, spacing, radius } = useTheme();

  const totalStock = products.reduce((sum, p) => sum + p.soluong, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.soluong, 0);

  return (
    <Card padded={false} style={[styles.tableCard, { borderColor: colors.border }]}>
      <View
        style={[
          styles.tableHeaderRow,
          {
            backgroundColor: colors.surfaceAlt,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={{ width: 84 }}>
          <AppText variant="caption" tone="muted" style={styles.colHeader}>
            HÌNH ẢNH
          </AppText>
        </View>
        <View style={{ flex: 3.2 }}>
          <AppText variant="caption" tone="muted" style={styles.colHeader}>
            TÊN SẢN PHẨM & MÃ ID
          </AppText>
        </View>
        <View style={{ flex: 2 }}>
          <AppText variant="caption" tone="muted" style={styles.colHeader}>
            ĐƠN GIÁ (VNĐ)
          </AppText>
        </View>
        <View style={{ flex: 2 }}>
          <AppText variant="caption" tone="muted" style={styles.colHeader}>
            TỒN KHO
          </AppText>
        </View>
        <View style={{ flex: 2 }}>
          <AppText variant="caption" tone="muted" style={styles.colHeader}>
            THÀNH TIỀN TỒN
          </AppText>
        </View>
        <View style={{ width: 140, alignItems: 'flex-end' }}>
          <AppText variant="caption" tone="muted" style={styles.colHeader}>
            THAO TÁC
          </AppText>
        </View>
      </View>

      {products.map((p, idx) => {
        const isOutOfStock = p.soluong === 0;
        const isLowStock = p.soluong > 0 && p.soluong <= 5;
        const dotColor = isOutOfStock
          ? colors.danger
          : isLowStock
            ? colors.accent
            : colors.success;
        const badgeBg = isOutOfStock
          ? colors.dangerSoft
          : isLowStock
            ? colors.accentSoft
            : colors.successSoft;
        const badgeText = isOutOfStock
          ? 'Hết hàng (0)'
          : isLowStock
            ? `Sắp hết (${p.soluong})`
            : `Còn ${p.soluong} sp`;

        return (
          <View
            key={p.id}
            style={[
              styles.tableRow,
              {
                borderBottomColor: colors.border,
                backgroundColor: idx % 2 === 1 ? colors.surfaceAlt : colors.surface,
              },
            ]}
          >
            <View style={{ width: 84 }}>
              <Pressable
                onPress={() => (p.image && onPreviewImage ? onPreviewImage(p.image) : onView(p))}
                style={styles.thumbWrapper}
              >
                {p.image ? (
                  <Image
                    source={{ uri: p.image }}
                    style={[
                      styles.thumb,
                      { borderRadius: radius.md, borderColor: colors.border },
                    ]}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.thumb,
                      {
                        borderRadius: radius.md,
                        backgroundColor: colors.surfaceAlt,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Ionicons name="cube-outline" size={22} color={colors.textMuted} />
                  </View>
                )}
              </Pressable>
            </View>

            <View style={{ flex: 3.2, paddingRight: spacing.sm }}>
              <Pressable onPress={() => onView(p)}>
                <AppText variant="bodyStrong" numberOfLines={2}>
                  {p.name}
                </AppText>
              </Pressable>
              <AppText variant="caption" tone="muted" style={{ marginTop: 2 }}>
                ID: {p.id.slice(0, 12)}…
              </AppText>
            </View>

            <View style={{ flex: 2 }}>
              <AppText variant="bodyStrong" tone="primary" style={{ fontWeight: '700' }}>
                {p.price.toLocaleString('vi-VN')} đ
              </AppText>
            </View>

            <View style={{ flex: 2 }}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: badgeBg, borderRadius: radius.pill },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                <AppText
                  variant="caption"
                  style={{
                    color: dotColor,
                    fontWeight: '700',
                  }}
                >
                  {badgeText}
                </AppText>
              </View>
            </View>

            <View style={{ flex: 2 }}>
              <AppText variant="body">
                {(p.price * p.soluong).toLocaleString('vi-VN')} đ
              </AppText>
            </View>

            <View
              style={{
                width: 140,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Button
                label="Xem"
                variant="secondary"
                size="sm"
                onPress={() => onView(p)}
              />
              <IconButton
                icon={<Ionicons name="pencil-outline" size={17} color={colors.primary} />}
                accessibilityLabel="Chỉnh sửa sản phẩm"
                onPress={() => onEdit(p)}
              />
              <IconButton
                icon={<Ionicons name="trash-outline" size={17} color={colors.danger} />}
                accessibilityLabel="Xóa sản phẩm"
                onPress={() => onDelete(p)}
              />
            </View>
          </View>
        );
      })}

      <View
        style={[
          styles.tableFooterRow,
          {
            backgroundColor: colors.surfaceAlt,
            borderTopColor: colors.border,
          },
        ]}
      >
        <AppText variant="caption" tone="muted" style={{ fontWeight: '700' }}>
          ĐANG HIỂN THỊ: {products.length} MẶT HÀNG
        </AppText>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <AppText variant="caption" tone="muted" style={{ fontWeight: '600' }}>
            Tổng số lượng tồn: <AppText variant="caption" style={{ fontWeight: '700' }}>{totalStock} sp</AppText>
          </AppText>
          <AppText variant="caption" tone="primary" style={{ fontWeight: '800' }}>
            Tổng giá trị kho: {totalValue.toLocaleString('vi-VN')} đ
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tableCard: {
    overflow: 'hidden',
    width: '100%',
    borderWidth: 1,
  },
  colHeader: {
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumbWrapper: {
    alignItems: 'flex-start',
  },
  thumb: {
    width: 54,
    height: 54,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  tableFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
