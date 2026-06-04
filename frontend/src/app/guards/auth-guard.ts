import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth/auth';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.checkAuth().pipe(
    map((response: any) => {
      if (response.authenticated) {
        return true;
      }

      return router.createUrlTree(['/login']);
    }),

    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
