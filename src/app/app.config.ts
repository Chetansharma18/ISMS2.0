import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideApiHttp } from './core/http/http.providers';
import { withTableAccessGuard } from './core/permissions/table-access.guard';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Screens of backend tables open only with a GET permission on the table (GET /auth/permissions).
    provideRouter(
      withTableAccessGuard(routes),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideApiHttp()
  ]
};
