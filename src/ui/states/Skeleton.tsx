import { useEffect, useState } from 'react';
import {
  Animated,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  width?: DimensionValue;
  height?: number;
  radiusToken?: keyof ReturnType<typeof useTheme>['radius'];
  style?: StyleProp<ViewStyle>;
};

/**
 * Khối xám nhấp nháy thay cho nội dung khi đang tải.
 *
 * Vì sao dùng skeleton thay spinner: giữ được bố cục, không nhảy layout khi dữ liệu về.
 * Animation chạy trên native thread (opacity + useNativeDriver) nên không ảnh hưởng JS.
 */
export function Skeleton({ width = '100%', height = 16, radiusToken = 'sm', style }: Props) {
  const { colors, radius } = useTheme();
  // useState(lazy) thay vì useRef: giá trị khởi tạo một lần, không đọc ref trong lúc render.
  const [opacity] = useState(() => new Animated.Value(0.55));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: radius[radiusToken], backgroundColor: colors.skeleton, opacity },
        style,
      ]}
    />
  );
}
