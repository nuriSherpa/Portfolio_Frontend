export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;
  cooldownUntil?: string;

  constructor(message: string, statusCode: number, code: string = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';

    // Extract cooldown if present
    if (details?.cooldownUntil) {
      this.cooldownUntil = details.cooldownUntil;
    }
  }
}

export function handleApiError(error: any): ApiError {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    const errorData = data?.error || data;

    // Extract code from various possible locations
    const code = errorData?.code || errorData?.details?.code || 'UNKNOWN_ERROR';
    const message = errorData?.message || 'An error occurred';
    const details = errorData?.details || errorData;

    switch (code) {
      case 'VISITOR_BLOCKED':
        return new ApiError(
          'Too many requests. Please try again later.',
          429, // Show as rate limit, not 401
          'RATE_LIMITED',
          details,
        );

      case 'VISITOR_TOKEN_INVALID':
      case 'UNAUTHORIZED':
        return new ApiError(
          message || 'Session expired. Please refresh.',
          401,
          'UNAUTHORIZED',
          details,
        );

      case 'RATE_LIMITED':
        return new ApiError(
          message || 'Too many requests. Please slow down.',
          429,
          'RATE_LIMITED',
          details,
        );

      case 'NOT_FOUND':
        return new ApiError(message || 'Resource not found', 404, 'NOT_FOUND', details);

      case 'VALIDATION_ERROR':
        return new ApiError(message || 'Invalid data provided', 400, 'VALIDATION_ERROR', details);

      default:
        return new ApiError(message || 'An unexpected error occurred', status, code, details);
    }
  } else if (error.request) {
    // Network error - no response from server
    return new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
  } else {
    // Something else happened
    return new ApiError(error.message || 'An unexpected error occurred', 0, 'UNKNOWN_ERROR');
  }
}

// Parse cooldown time from error
export function parseCooldownTime(error: ApiError): number | null {
  if (error.cooldownUntil) {
    const cooldownDate = new Date(error.cooldownUntil);
    const now = new Date();
    const diffMs = cooldownDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / 1000));
  }
  return null;
}
