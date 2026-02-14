import { ErrorDisplay } from './error-display';
import { RateLimitBlocker } from './rate-limit-blocker';
import { CooldownBlocker } from './cooldown-blocker';
import { ApiError } from '@/lib/utils/api-error';

interface PageErrorProps {
  error: ApiError | null;
  rateLimited: boolean;
  cooldownSeconds: number;
  onRetry: () => void;
}

export function PageError({ error, rateLimited, cooldownSeconds, onRetry }: PageErrorProps) {
  if (!error && !rateLimited) return null;

  // Show cooldown for rate limits
  if (rateLimited && cooldownSeconds > 0) {
    return <CooldownBlocker retryAfter={cooldownSeconds} onRetry={onRetry} />;
  }

  // Show generic rate limit (no cooldown time)
  if (rateLimited) {
    return <RateLimitBlocker retryAfter={5} onRetry={onRetry} />;
  }

  // Show error display
  return (
    <ErrorDisplay
      statusCode={error?.statusCode || 500}
      title={error?.code === 'NOT_FOUND' ? 'Not Found' : 'Error Loading Page'}
      message={error?.message || 'Something went wrong'}
      onRetry={onRetry}
    />
  );
}
