import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Card, Skeleton } from '@/ui';

export function UserDetailSkeleton() {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.lg }}>
      <Card>
        <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md }}>
          <Skeleton width={128} height={128} radiusToken="xl" />
          <Skeleton height={22} width="55%" />
          <Skeleton height={14} width="70%" />
        </View>
      </Card>

      <Card>
        <View style={{ gap: spacing.md }}>
          <Skeleton height={16} width="40%" />
          <Skeleton height={16} width="85%" />
          <Skeleton height={16} width="60%" />
        </View>
      </Card>

      <Skeleton height={48} width="100%" radiusToken="md" />
    </View>
  );
}