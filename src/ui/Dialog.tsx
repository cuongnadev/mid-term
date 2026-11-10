import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { elevation, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  loading?: boolean;
};

export function Dialog({
  visible,
  title,
  message,
  confirmLabel = 'Đồng ý',
  cancelLabel = 'Huỷ',
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
}: Props) {
  const { colors, radius, spacing, scheme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={loading ? undefined : onCancel}
          accessibilityRole="button"
          accessibilityLabel="Đóng hộp thoại"
        />
        <View
          style={[
            styles.card,
            elevation(3, scheme),
            { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
          ]}
        >
          <AppText variant="heading">{title}</AppText>
          {message ? (
            <AppText variant="body" tone="muted">
              {message}
            </AppText>
          ) : null}
          <View style={[styles.actions, { marginTop: spacing.md }]}>
            <Button label={cancelLabel} variant="secondary" onPress={onCancel} disabled={loading} style={styles.action} />
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420 },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
});
