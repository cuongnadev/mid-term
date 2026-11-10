import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isAdminEmail } from '@/core/config/appConfig';
import { useTheme } from '@/theme';
import { AppText, Avatar, Badge, Card, IconButton } from '@/ui';
import type { UserRecord } from '../types';

type Props = {
  user: UserRecord;
  isCurrentUser?: boolean;
  onPress: (user: UserRecord) => void;
  onDelete?: (user: UserRecord) => void;
};

function UserCardBase({ user, isCurrentUser = false, onPress, onDelete }: Props) {
  const { colors, spacing } = useTheme();
  const displayName = user.hoten || 'Chưa cập nhật tên';
  const admin = isAdminEmail(user.email);

  return (
    <Card padded={false}>
      <View style={[styles.row, { paddingRight: spacing.sm }]}>
        <Pressable
          onPress={() => onPress(user)}
          accessibilityRole="button"
          accessibilityLabel={`${displayName}, ${user.email}`}
          style={({ pressed }) => [
            styles.mainPressable,
            { padding: spacing.md, gap: spacing.md },
            pressed ? { opacity: 0.78 } : null,
          ]}
        >
          <Avatar uri={user.hinhanh} name={displayName} size={56} rounded="full" />

          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
              <AppText variant="subheading" numberOfLines={1} style={{ flexShrink: 1 }}>
                {displayName}
              </AppText>
              {admin ? <Badge label="Admin" tone="primary" /> : null}
              {isCurrentUser ? <Badge label="Bạn" tone="accent" /> : null}
            </View>

            <AppText variant="caption" tone="muted" numberOfLines={1}>
              {user.email}
            </AppText>
          </View>

          {!onDelete ? (
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          ) : null}
        </Pressable>

        {onDelete ? (
          <IconButton
            icon={<Ionicons name="trash-outline" size={20} color={colors.danger} />}
            accessibilityLabel={`Xoá ${displayName}`}
            onPress={() => onDelete(user)}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainPressable: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export const UserCard = memo(UserCardBase);