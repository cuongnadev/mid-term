import type { ComponentRef, ReactNode, Ref } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

type ScrollViewInstance = ComponentRef<typeof ScrollView>;

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  background?: 'background' | 'surface';
  maxWidth?: number;
  scrollRef?: Ref<ScrollViewInstance>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['bottom'],
  background = 'background',
  maxWidth = 680,
  scrollRef,
  contentContainerStyle,
  style,
}: Props) {
  const { colors, spacing } = useTheme();

  const backgroundColor = background === 'surface' ? colors.surface : colors.background;
  const padding: StyleProp<ViewStyle> = padded
    ? { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }
    : null;
  const widthConstraint: StyleProp<ViewStyle> = maxWidth > 0 ? { maxWidth } : null;

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor }, style]}>
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.container, widthConstraint, padding, contentContainerStyle]}>
            {children}
          </View>
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.container, widthConstraint, padding, contentContainerStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  container: {
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
  },
});