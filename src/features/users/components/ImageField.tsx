import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ImagePickSource } from '@/core/utils';
import { useTheme } from '@/theme';
import { AppText, Avatar, Button, Card } from '@/ui';

type Props = {
  label?: string;
  value: string;
  name?: string;
  busy?: boolean;
  error?: string | null;
  onPick: (source: ImagePickSource) => void;
  onRemove: () => void;
};

export function ImageField({
  label = 'Ảnh đại diện',
  value,
  name = '',
  busy = false,
  error,
  onPick,
  onRemove,
}: Props) {
  const { colors, spacing } = useTheme();
  const hasImage = value.trim().length > 0;
  const avatarSize = 88;

  return (
    <Card>
      <View style={{ gap: spacing.sm }}>
        <AppText variant="label">{label}</AppText>

        <View style={styles.contentRow}>
          <View style={styles.previewWrap}>
            <Avatar uri={value} name={name} size={avatarSize} rounded="full" />
            {busy ? (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  styles.busyOverlay,
                  { backgroundColor: colors.overlay, borderRadius: avatarSize / 2 },
                ]}
              >
                <ActivityIndicator color={colors.onPrimary} />
              </View>
            ) : null}
          </View>

          <View style={[styles.actionsColumn, { gap: spacing.sm }]}>
            <View style={[styles.actionsWrap, { gap: spacing.sm }]}>
              <Button
                label={hasImage ? 'Đổi ảnh' : 'Chọn ảnh'}
                size="sm"
                variant="secondary"
                icon={<Ionicons name="image-outline" size={16} color={colors.onPrimarySoft} />}
                onPress={() => onPick('library')}
                disabled={busy}
              />

              {Platform.OS !== 'web' ? (
                <Button
                  label="Chụp ảnh"
                  size="sm"
                  variant="secondary"
                  icon={<Ionicons name="camera-outline" size={16} color={colors.onPrimarySoft} />}
                  onPress={() => onPick('camera')}
                  disabled={busy}
                />
              ) : null}

              {hasImage ? (
                <Button
                  label="Xoá ảnh"
                  size="sm"
                  variant="danger"
                  icon={<Ionicons name="trash-outline" size={16} color={colors.onDanger} />}
                  onPress={onRemove}
                  disabled={busy}
                />
              ) : null}
            </View>

            {error ? (
              <AppText variant="caption" tone="danger">
                {error}
              </AppText>
            ) : (
              <AppText variant="caption" tone="muted">
                Ảnh tự động nén nhỏ (dưới 1MB) để lưu vào Firestore.
              </AppText>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  previewWrap: {
    position: 'relative',
  },
  busyOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsColumn: {
    flex: 1,
    minWidth: 180,
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});