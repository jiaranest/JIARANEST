import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { CatalogService } from './core/data/catalog.service';
import { MockCatalogService } from './core/data/mock-catalog.service';
import { HttpCatalogService } from './core/data/http-catalog.service';
import { AuthService } from './core/state/auth.service';
import { MockAuthService } from './core/state/mock-auth.service';
import { HttpAuthService } from './core/state/http-auth.service';
import { OrderService } from './core/data/order.service';
import { MockOrderService } from './core/data/mock-order.service';
import { HttpOrderService } from './core/data/http-order.service';
import { authInterceptor } from './core/data/auth.interceptor';
import { environment } from './core/config/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    // The data + auth seams. Both flip on environment.useApi: the real NestJS
    // API (Http*) or the in-memory Phase-1 stubs (Mock*), kept as fallbacks.
    {
      provide: CatalogService,
      useClass: environment.useApi ? HttpCatalogService : MockCatalogService,
    },
    {
      provide: AuthService,
      useClass: environment.useApi ? HttpAuthService : MockAuthService,
    },
    {
      provide: OrderService,
      useClass: environment.useApi ? HttpOrderService : MockOrderService,
    },
  ],
};
