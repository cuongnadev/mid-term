import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  inset?: number;
  style?: StyleProp<ViewStyle>;
};

export function Divider({ inset = 0, style }: Props) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.line, { backgroundColor: colors.border, marginLeft: inset }, style]}
    />
  );
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
});
