import { Observable, timeout, catchError, defer } from 'rxjs';

/** How long to wait for the API before giving up and using the mock. */
export const FALLBACK_TIMEOUT_MS = 6000;

/**
 * Try the real API call; if it errors or takes too long, transparently fall
 * back to the mock. Both sides are provided as thunks so the mock isn't
 * subscribed unless it's actually needed.
 *
 *   withFallback(() => this.http.getX(), () => this.mock.getX())
 *
 * The `defer` wrappers ensure each observable is created lazily at subscribe
 * time (important so a failed HTTP attempt doesn't also eagerly run the mock).
 */
export function withFallback<T>(
  httpCall: () => Observable<T>,
  mockCall: () => Observable<T>,
): Observable<T> {
  return defer(httpCall).pipe(
    timeout(FALLBACK_TIMEOUT_MS),
    catchError(() => defer(mockCall)),
  );
}
