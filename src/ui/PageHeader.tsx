import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
};

export function PageHeader({ title, subtitle, showBack = false, onBack, right }: Props) {
  const { colors, spacing } = useTheme();

  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={[styles.row, { gap: spacing.sm, marginBottom: spacing.lg }]}>
      {showBack ? (
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={colors.text} />}
          accessibilityLabel="Quay lại"
          variant="soft"
          onPress={goBack}
        />
      ) : null}

      <View style={styles.titles}>
        <AppText variant="title" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  titles: { flex: 1, gap: 2 },
});
