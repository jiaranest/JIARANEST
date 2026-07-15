import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../config/environment';

const TOKEN_KEY = 'jiara.auth.token.v1';

/**
 * Attaches `Authorization: Bearer <jwt>` to requests going to our API, when a
 * token is stored. Reads localStorage directly (rather than injecting
 * HttpAuthService) to avoid a circular dependency — that service uses HttpClient.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  let token: string | null = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    token = null;
  }
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
