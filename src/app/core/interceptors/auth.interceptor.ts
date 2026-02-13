import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

let refreshing = false;
const refreshDone$ = new Subject<boolean>();

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const tokenStorage = inject(TokenStorageService);
  const auth = inject(AuthService);
  const router = inject(Router);

  const accessToken = tokenStorage.getAccessToken();

  let authReq = req;

  if (accessToken) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      if (err.status !== 401) {
        return throwError(() => err);
      }

      const isAuthCall =
        req.url.includes('/api/auth/login') ||
        req.url.includes('/api/auth/refresh') ||
        req.url.includes('/api/auth/logout');

      if (isAuthCall) {
        tokenStorage.clearAll();
        router.navigateByUrl('/login');
        return throwError(() => err);
      }

      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        tokenStorage.clearAll();
        router.navigateByUrl('/login');
        return throwError(() => err);
      }

      if (refreshing) {
        return refreshDone$.pipe(
          filter((ok) => ok === true),
          take(1),
          switchMap(() => {
            const newToken = tokenStorage.getAccessToken();
            if (!newToken) {
              router.navigateByUrl('/login');
              return throwError(() => err);
            }

            const retry = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            return next(retry);
          })
        );
      }

      refreshing = true;

      return auth.refresh().pipe(
        switchMap(() => {
          refreshing = false;
          refreshDone$.next(true);

          const newToken = tokenStorage.getAccessToken();
          if (!newToken) {
            router.navigateByUrl('/login');
            return throwError(() => err);
          }

          const retry = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });

          return next(retry);
        }),
        catchError((refreshErr) => {
          refreshing = false;
          refreshDone$.next(false);
          tokenStorage.clearAll();
          router.navigateByUrl('/login');
          return throwError(() => refreshErr);
        })
      );
    })
  );
}
