import {
  ApplicationConfig,
  Type,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { CatalogService } from './core/data/catalog.service';
import { MockCatalogService } from './core/data/mock-catalog.service';
import { HttpCatalogService } from './core/data/http-catalog.service';
import { FallbackCatalogService } from './core/data/fallback-catalog.service';
import { AuthService } from './core/state/auth.service';
import { MockAuthService } from './core/state/mock-auth.service';
import { HttpAuthService } from './core/state/http-auth.service';
import { FallbackAuthService } from './core/state/fallback-auth.service';
import { OrderService } from './core/data/order.service';
import { MockOrderService } from './core/data/mock-order.service';
import { HttpOrderService } from './core/data/http-order.service';
import { FallbackOrderService } from './core/data/fallback-order.service';
import { authInterceptor } from './core/data/auth.interceptor';
import { environment } from './core/config/environment';

/**
 * Pick the implementation for the configured data mode. `T` is pinned to the
 * abstract base (e.g. CatalogService) so the three sibling impls are all
 * accepted as `Type<T>` rather than being inferred from the first argument.
 */
function forMode<T>(api: Type<T>, mock: Type<T>, fallback: Type<T>): Type<T> {
  switch (environment.dataMode) {
    case 'api':
      return api;
    case 'mock':
      return mock;
    default:
      return fallback; // 'fallback' — try API, use mock on error
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    // The data + auth + orders seams. Each resolves to the Http, Mock, or
    // Fallback (API-with-mock-backup) impl per environment.dataMode.
    {
      provide: CatalogService,
      useClass: forMode<CatalogService>(
        HttpCatalogService,
        MockCatalogService,
        FallbackCatalogService,
      ),
    },
    {
      provide: AuthService,
      useClass: forMode<AuthService>(HttpAuthService, MockAuthService, FallbackAuthService),
    },
    {
      provide: OrderService,
      useClass: forMode<OrderService>(HttpOrderService, MockOrderService, FallbackOrderService),
    },
  ],
};
