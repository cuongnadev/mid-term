import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isAdminEmail } from '@/core/config/appConfig';
import type { UserListFilter } from '@/features/users/hooks/useUsers';
import type { UserRecord } from '@/features/users/types';
import { useTheme } from '@/theme';
import { AppText, Button, Card } from '@/ui';

type Props = {
  users: readonly UserRecord[];
  activeFilter: UserListFilter;
  aiActive: boolean;
  onSelectFilter: (filter: UserListFilter) => void;
};

type StatCardConfig = {
  key: UserListFilter;
  label: string;
  value: number;
  icon: 'people-outline' | 'image-outline' | 'alert-circle-outline' | 'shield-checkmark-outline';
};

export function AdminDashboard({ users, activeFilter, aiActive, onSelectFilter }: Props) {
  const { colors, radius, spacing } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const total = users.length;
  const withAvatar = users.filter((u) => u.hinhanh.trim().length > 0).length;
  const withoutAvatar = total - withAvatar;
  const adminCount = users.filter((u) => isAdminEmail(u.email)).length;
  const completedCount = users.filter(
    (u) => u.hoten.trim().length > 0 && u.hinhanh.trim().length > 0,
  ).length;
  const completionPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const cards: StatCardConfig[] = [
    { key: 'all', label: 'Tất cả', value: total, icon: 'people-outline' },
    { key: 'with_avatar', label: 'Có ảnh', value: withAvatar, icon: 'image-outline' },
    { key: 'without_avatar', label: 'Chưa có ảnh', value: withoutAvatar, icon: 'alert-circle-outline' },
    { key: 'admin', label: 'Admin', value: adminCount, icon: 'shield-checkmark-outline' },
  ];

  return (
    <Card>
      <View style={{ gap: spacing.md }}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <AppText variant="subheading">Dashboard thống kê</AppText>
            <AppText variant="caption" tone="muted">
              Chạm vào thẻ để lọc nhanh danh sách
            </AppText>
          </View>
          <Button
            label={collapsed ? 'Mở rộng' : 'Thu gọn'}
            size="sm"
            variant="ghost"
            onPress={() => setCollapsed((prev) => !prev)}
          />
        </View>

        {!collapsed ? (
          <>
            <View style={[styles.grid, { gap: spacing.sm }]}>
              {cards.map((item) => {
                const selected = !aiActive && activeFilter === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => onSelectFilter(item.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Lọc ${item.label}: ${item.value} người dùng`}
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.statTile,
                      {
                        borderRadius: radius.md,
                        padding: spacing.md,
                        backgroundColor: selected ? colors.primarySoft : colors.surfaceAlt,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                      pressed ? { opacity: 0.85 } : null,
                    ]}
                  >
                    <View style={styles.tileTop}>
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={selected ? colors.primary : colors.textMuted}
                      />
                      <AppText
                        variant="caption"
                        tone={selected ? 'primarySoft' : 'muted'}
                        numberOfLines={1}
                      >
                        {item.label}
                      </AppText>
                    </View>
                    <AppText
                      variant="title"
                      tone={selected ? 'primary' : 'default'}
                    >
                      {item.value}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ gap: spacing.xs }}>
              <View style={styles.progressHeader}>
                <AppText variant="caption" tone="muted">
                  Tỷ lệ hoàn thiện hồ sơ (đủ tên + ảnh)
                </AppText>
                <AppText variant="caption" tone="primary" style={{ fontWeight: '700' }}>
                  {completionPct}% ({completedCount}/{total})
                </AppText>
              </View>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${completionPct}%`,
                      backgroundColor: colors.success,
                      borderRadius: radius.pill,
                    },
                  ]}
                />
              </View>
            </View>
          </>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statTile: {
    flex: 1,
    minWidth: 132,
    borderWidth: 1,
    gap: 6,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});