import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { initials } from '@/core/utils/text';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

type Props = {
  uri?: string | null;
  name?: string;
  size?: number;
  rounded?: 'full' | 'md' | 'lg' | 'xl';
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ uri, name = '', size = 56, rounded = 'full', style }: Props) {
  const { colors, radius } = useTheme();
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const trimmedUri = uri?.trim() ?? '';
  const showImage = trimmedUri.length > 0 && trimmedUri !== failedUri;

  const borderRadius =
    rounded === 'full'
      ? size / 2
      : rounded === 'xl'
        ? radius.xl
        : rounded === 'lg'
          ? radius.lg
          : radius.md;

  const textVariant = size >= 96 ? 'display' : size >= 64 ? 'title' : 'heading';

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: trimmedUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          onError={() => setFailedUri(trimmedUri)}
        />
      ) : (
        <AppText variant={textVariant} tone="muted">
          {initials(name)}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
});