import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Card, Skeleton } from '@/ui';

type Props = {
  count?: number;
};

export function UserListSkeleton({ count = 6 }: Props) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.md }}>
      {Array.from({ length: count }, (_, index) => (
        <Card key={`user-skeleton-${index}`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Skeleton width={64} height={64} radiusToken="md" />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton height={16} width="65%" />
              <Skeleton height={12} width="80%" />
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}