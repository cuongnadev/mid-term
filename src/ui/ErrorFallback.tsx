import { View } from 'react-native';
import { describeError, type AppError } from '@/core/errors';
import { AppText, ErrorState, Screen } from '@/ui';

type Props = {
  error: AppError;
  onReset: () => void;
};

export function ErrorFallback({ error, onReset }: Props) {
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ErrorState
          title="Ứng dụng gặp sự cố"
          message={error.message}
          onRetry={onReset}
          retryLabel="Thử lại"
        />
        {__DEV__ ? (
          <AppText variant="caption" tone="muted" align="center">
            {describeError(error)}
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}
