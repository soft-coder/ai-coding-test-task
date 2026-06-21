import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { AppPreset } from './core/theme/app-preset';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
// Import from the specific module, not the barrel, so the whole generated
// client isn't pulled into the initial bundle (services are tree-shakeable).
import { BASE_PATH } from './core/api/variables';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    // Base URL for the generated API client (from .env → environment).
    { provide: BASE_PATH, useValue: environment.apiBaseUrl },
    provideAnimationsAsync(),
    MessageService,
    providePrimeNG({
      theme: {
        preset: AppPreset,
        // Design is light-only; disable PrimeNG's automatic dark mode.
        options: { darkModeSelector: false },
      },
    }),
  ],
};
