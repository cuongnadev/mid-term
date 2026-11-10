import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

export type BadgeTone = 'primary' | 'muted' | 'accent' | 'danger' | 'success';

type Props = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'primary' }: Props) {
  const { colors, radius } = useTheme();

  const palette: Record<BadgeTone, { background: string; foreground: string }> = {
    primary: { background: colors.primarySoft, foreground: colors.onPrimarySoft },
    muted: { background: colors.surfaceAlt, foreground: colors.textMuted },
    accent: { background: colors.accentSoft, foreground: colors.accent },
    danger: { background: colors.dangerSoft, foreground: colors.danger },
    success: { background: colors.successSoft, foreground: colors.success },
  };

  const { background, foreground } = palette[tone];

  return (
    <View style={[styles.base, { backgroundColor: background, borderRadius: radius.sm }]}>
      <AppText variant="caption" style={{ color: foreground }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
