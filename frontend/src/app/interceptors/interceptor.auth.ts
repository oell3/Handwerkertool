import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';

import { inject } from '@angular/core';
import { AuthService } from '../service/auth/auth';

import { catchError, switchMap, throwError, of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Cookies automatisch mitsenden
  const cloned = req.clone({
    withCredentials: true,
  });

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      console.error('HTTP Error:', {
        status: err.status,
        message: err.message,
        url: err.url,
      });

      // Kein Refresh auf Login/Refresh selbst
      if (err.status === 401 && !req.url.includes('/login') && !req.url.includes('/refresh')) {
        return auth.refresh().pipe(
          switchMap(() => {
            console.log('Token refreshed, retrying request');
            return next(cloned);
          }),

          catchError((refreshErr: HttpErrorResponse) => {
            console.error('Token refresh failed:', {
              status: refreshErr.status,
              message: refreshErr.message,
            });
            // Logout bei fehlgeschlagenem Refresh
            auth.logout();
            return throwError(
              () => new Error('Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.'),
            );
          }),
        );
      }

      // Allgemeine Fehlerbehandlung für andere HTTP-Fehler
      if (err.status >= 500) {
        console.error('Server-Fehler:', err.status);
        return throwError(
          () => new Error(`Server-Fehler (${err.status}). Bitte versuchen Sie es später erneut.`),
        );
      }

      if (err.status >= 400 && err.status !== 401) {
        console.warn('Client-Fehler:', err.status, err.error?.message);
      }

      return throwError(() => err);
    }),
  );
};
