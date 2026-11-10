import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { analyzeProductInventory, type ProductInventoryAiResult } from '@/features/ai/aiService';
import { useTheme } from '@/theme';
import { AppText, Button, Card } from '@/ui';
import type { ProductRecord } from '../types';

type Props = {
  products: ProductRecord[];
};

export function ProductDashboard({ products }: Props) {
  const { colors, spacing, radius } = useTheme();

  const totalItems = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.soluong, 0);
  const totalValue = products.reduce((acc, p) => acc + p.price * p.soluong, 0);
  const lowStockCount = products.filter((p) => p.soluong <= 5).length;

  const [aiResult, setAiResult] = useState<ProductInventoryAiResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAnalyze = async () => {
    setLoadingAi(true);
    try {
      const res = await analyzeProductInventory(products);
      setAiResult(res);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <View style={{ marginBottom: spacing.lg, gap: spacing.md }}>
      <View style={styles.grid}>
        <Card style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <View style={styles.statContentRow}>
            <View>
              <AppText variant="caption" tone="muted" style={styles.statLabel}>
                DANH MỤC MẶT HÀNG
              </AppText>
              <AppText variant="display" style={styles.statValue}>
                {totalItems}
              </AppText>
              <AppText variant="caption" tone="primary" style={{ marginTop: 2 }}>
                Đang quản lý trong kho
              </AppText>
            </View>
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: colors.primarySoft, borderRadius: radius.md },
              ]}
            >
              <Ionicons name="cube-outline" size={24} color={colors.primary} />
            </View>
          </View>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: colors.success }]}>
          <View style={styles.statContentRow}>
            <View>
              <AppText variant="caption" tone="muted" style={styles.statLabel}>
                TỔNG SỐ LƯỢNG TỒN
              </AppText>
              <AppText variant="display" style={styles.statValue}>
                {totalStock} <AppText variant="heading" tone="muted">sp</AppText>
              </AppText>
              <AppText variant="caption" tone="success" style={{ marginTop: 2 }}>
                Sẵn sàng cung ứng
              </AppText>
            </View>
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: colors.successSoft, borderRadius: radius.md },
              ]}
            >
              <Ionicons name="layers-outline" size={24} color={colors.success} />
            </View>
          </View>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: colors.accent }]}>
          <View style={styles.statContentRow}>
            <View>
              <AppText variant="caption" tone="muted" style={styles.statLabel}>
                TỔNG VỐN TỒN KHO
              </AppText>
              <AppText
                variant="heading"
                tone="primary"
                style={[styles.statValue, { fontSize: 20 }]}
              >
                {totalValue.toLocaleString('vi-VN')} đ
              </AppText>
              <AppText variant="caption" tone="muted" style={{ marginTop: 2 }}>
                Định giá theo đơn giá
              </AppText>
            </View>
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: colors.accentSoft, borderRadius: radius.md },
              ]}
            >
              <Ionicons name="cash-outline" size={24} color={colors.accent} />
            </View>
          </View>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: colors.danger }]}>
          <View style={styles.statContentRow}>
            <View>
              <AppText variant="caption" tone="muted" style={styles.statLabel}>
                SẮP HẾT / HẾT HÀNG
              </AppText>
              <AppText
                variant="display"
                tone={lowStockCount > 0 ? 'danger' : 'default'}
                style={styles.statValue}
              >
                {lowStockCount} <AppText variant="heading" tone="muted">sp</AppText>
              </AppText>
              <AppText
                variant="caption"
                tone={lowStockCount > 0 ? 'danger' : 'muted'}
                style={{ marginTop: 2 }}
              >
                {lowStockCount > 0 ? 'Cần lên đơn nhập thêm' : 'Tồn kho ổn định'}
              </AppText>
            </View>
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: colors.dangerSoft, borderRadius: radius.md },
              ]}
            >
              <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
            </View>
          </View>
        </Card>
      </View>

      <Card
        style={[
          styles.aiCard,
          {
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.aiHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={[
                styles.aiLogoBox,
                { backgroundColor: colors.primary, borderRadius: radius.sm },
              ]}
            >
              <Ionicons name="sparkles" size={16} color={colors.onPrimary} />
            </View>
            <View>
              <AppText variant="subheading" style={{ fontWeight: '700' }}>
                Trợ lý Gemini AI Phân tích Tồn kho & Định giá
              </AppText>
              <AppText variant="caption" tone="muted">
                Powered by Google Gemini 3.8 Flash • Tự động rà soát & đề xuất chiến lược
              </AppText>
            </View>
          </View>

          <Button
            label={loadingAi ? 'Đang phân tích…' : '✨ Phân tích kho ngay'}
            variant="primary"
            size="sm"
            onPress={handleAnalyze}
            disabled={loadingAi}
          />
        </View>

        {loadingAi ? (
          <View style={styles.aiLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText variant="caption" tone="muted" style={{ marginLeft: 8 }}>
              Gemini AI đang tổng hợp số liệu và phân tích kho hàng…
            </AppText>
          </View>
        ) : null}

        {aiResult ? (
          <View style={[styles.aiResultWrapper, { borderTopColor: colors.border }]}>
            <AppText variant="bodyStrong" style={{ marginBottom: 6 }}>
              {aiResult.summary}
            </AppText>

            <View style={styles.aiColumns}>
              <View style={[styles.aiColCard, { backgroundColor: colors.surface, borderRadius: radius.sm }]}>
                <AppText variant="caption" tone="danger" style={{ fontWeight: '700', marginBottom: 4 }}>
                  Cảnh báo hàng sắp cạn kho:
                </AppText>
                {aiResult.lowStockInsights.length > 0 ? (
                  aiResult.lowStockInsights.map((item, idx) => (
                    <AppText key={idx} variant="caption" tone="muted" style={{ marginVertical: 1 }}>
                      • {item}
                    </AppText>
                  ))
                ) : (
                  <AppText variant="caption" tone="success">
                    Tất cả mặt hàng đều còn tồn an toàn.
                  </AppText>
                )}
              </View>

              <View style={[styles.aiColCard, { backgroundColor: colors.surface, borderRadius: radius.sm }]}>
                <AppText variant="caption" tone="primary" style={{ fontWeight: '700', marginBottom: 4 }}>
                  Đề xuất giá & kích cầu bán hàng:
                </AppText>
                {aiResult.pricingInsights.length > 0 ? (
                  aiResult.pricingInsights.map((item, idx) => (
                    <AppText key={idx} variant="caption" tone="muted" style={{ marginVertical: 1 }}>
                      • {item}
                    </AppText>
                  ))
                ) : (
                  <AppText variant="caption" tone="muted">
                    Giá bán hiện tại cân đối với thị trường.
                  </AppText>
                )}
              </View>
            </View>
          </View>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 220,
    borderLeftWidth: 4,
    padding: 16,
  },
  statContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  statValue: {
    marginTop: 4,
  },
  statIconBadge: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCard: {
    padding: 16,
    borderWidth: 1,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  aiLogoBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  aiResultWrapper: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  aiColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  aiColCard: {
    flex: 1,
    minWidth: 260,
    padding: 10,
  },
});
