import {
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { AuthService } from '../service/auth/auth';

import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    console.log('intercepted request');
    const auth = inject(AuthService);

    // Cookies automatisch mitsenden
    const cloned = req.clone({
        withCredentials: true
    });

    return next(cloned).pipe(

        catchError(err => {

            // Kein Refresh auf Login/Refresh selbst
            if(
                err.status === 401 &&
                !req.url.includes('/login') &&
                !req.url.includes('/refresh')
            ){

                return auth.refresh().pipe(

                    switchMap(() => {

                        return next(cloned);

                    }),

                    catchError(() => {

                        return throwError(
                            () => err
                        );

                    })

                );

            }

            return throwError(
                () => err
            );

        })

    );

};