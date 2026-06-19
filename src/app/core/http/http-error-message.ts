import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extracts a human-readable message from an HTTP error. The backend returns
 * RFC9110 ProblemDetails (`{ detail, title, status }`), so `detail` is preferred.
 */
export function httpErrorMessage(err: HttpErrorResponse): string {
  const body = err.error;
  if (typeof body === 'string' && body) return body;
  if (body?.detail) return body.detail;
  if (body?.title) return body.title;
  if (body?.message) return body.message;
  if (err.status === 0) return 'Network error. Please check your connection and try again.';
  return err.message || 'Unexpected error.';
}
