import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { evaluatePasswordStrength, type PasswordStrengthTone } from '@/core/utils';
import { useTheme } from '@/theme';
import { AppText } from '@/ui';

type Props = {
  password: string;
  hideWhenEmpty?: boolean;
};

export function PasswordStrengthBar({ password, hideWhenEmpty = false }: Props) {
  const { colors, radius, spacing } = useTheme();

  if (hideWhenEmpty && password.length === 0) {
    return null;
  }

  const strength = evaluatePasswordStrength(password);

  const toneColorMap: Record<PasswordStrengthTone, string> = {
    danger: colors.danger,
    accent: colors.accent,
    primary: colors.primary,
    success: colors.success,
  };

  const activeColor = toneColorMap[strength.tone];

  const criteriaItems = [
    { key: 'len', label: '≥ 6 ký tự', passed: strength.checks.minLength },
    { key: 'upper', label: 'Chữ hoa (A-Z)', passed: strength.checks.hasUpper },
    { key: 'num', label: 'Chữ số (0-9)', passed: strength.checks.hasNumber },
    { key: 'sym', label: 'Ký tự đặc biệt', passed: strength.checks.hasSpecial },
  ];

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={styles.headerRow}>
        <AppText variant="caption" tone="muted">
          Độ mạnh mật khẩu
        </AppText>
        <AppText variant="caption" style={{ color: activeColor, fontWeight: '700' }}>
          {strength.label}
        </AppText>
      </View>

      <View style={[styles.barsRow, { gap: spacing.xs }]}>
        {[1, 2, 3, 4].map((step) => {
          const filled = strength.score >= step;
          return (
            <View
              key={step}
              style={[
                styles.barSegment,
                {
                  borderRadius: radius.pill,
                  backgroundColor: filled ? activeColor : colors.surfaceAlt,
                },
              ]}
            />
          );
        })}
      </View>

      <View style={[styles.criteriaWrap, { gap: spacing.sm }]}>
        {criteriaItems.map((item) => (
          <View key={item.key} style={styles.criteriaItem}>
            <Ionicons
              name={item.passed ? 'checkmark-circle' : 'ellipse-outline'}
              size={14}
              color={item.passed ? colors.success : colors.textMuted}
            />
            <AppText
              variant="caption"
              tone={item.passed ? 'success' : 'muted'}
            >
              {item.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barSegment: {
    flex: 1,
    height: 6,
  },
  criteriaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});