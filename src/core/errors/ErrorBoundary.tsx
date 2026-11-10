import { Component, type ErrorInfo, type ReactNode } from 'react';
import { describeError, type AppError } from './AppError';
import { toAppError } from './errorMapper';

type Props = {
  children: ReactNode;
  fallback: (error: AppError, reset: () => void) => ReactNode;
};

type State = { error: AppError | null };

class ErrorBoundaryBase extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: toAppError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.warn('[ErrorBoundary]', describeError(toAppError(error)), info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) return this.props.fallback(error, this.reset);
    return this.props.children;
  }
}

export const ErrorBoundary = ErrorBoundaryBase;
