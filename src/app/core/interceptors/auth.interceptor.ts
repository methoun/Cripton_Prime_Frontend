import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  filter,
  finalize,
  switchMap,
  take,
  throwError,
} from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

/**
 * মেইন ইন্টারসেপ্টর ফাংশন
 */
export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const tokenStorage = inject(TokenStorageService);
  const auth = inject(AuthService);
  const router = inject(Router);
  const zone = inject(NgZone);

  const accessToken = tokenStorage.getAccessToken();
  let authReq = req;

  // টোকেন থাকলে হেডার সেট করুন
  if (accessToken) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return next(authReq).pipe(
    catchError((err: unknown) => {
      // যদি ৪০১ এরর হয় এবং এটি লগইন রিকোয়েস্ট না হয়
      if (err instanceof HttpErrorResponse && err.status === 401) {
        if (req.url.includes('/api/auth/')) {
          return handleLogout(auth, router, zone, err);
        }
        // টোকেন রিফ্রেশ লজিক কল করুন
        return handle401Error(req, next, auth, tokenStorage, router, zone);
      }
      return throwError(() => err);
    })
  );
}

/**
 * ৪০১ এরর হ্যান্ডেল এবং টোকেন রিফ্রেশ লজিক
 */
function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  auth: any,
  tokenStorage: TokenStorageService,
  router: Router,
  zone: NgZone
): Observable<HttpEvent<any>> {
  
  // যদি অলরেডি রিফ্রেশ হতে থাকে, তবে ওয়েট করুন
  if (auth.isRefreshing$.value) {
    return auth.refreshToken$.pipe(
      filter((token: any): token is string => token !== null),
      take(1),
      switchMap((newToken: string) => {
        return next(addTokenToRequest(req, newToken));
      })
    );
  }

  auth.isRefreshing$.next(true);
  auth.refreshToken$.next(null);

  return auth.refresh().pipe(
    switchMap((success: boolean) => {
      if (!success) {
        return handleLogout(auth, router, zone, new Error('Session Expired'));
      }

      const newToken = tokenStorage.getAccessToken();
      auth.refreshToken$.next(newToken);

      // ✅ সবচাইতে গুরুত্বপূর্ণ: ম্যানুয়াল সাবস্ক্রিপশন এবং জোন রান
      // এটি নিশ্চিত করে যে রিকোয়েস্ট শেষ হওয়ার পর UI থ্রেড আপডেট হবে
      return new Observable<HttpEvent<any>>((subscriber) => {
        next(addTokenToRequest(req, newToken!)).subscribe({
          next: (event) => {
            zone.run(() => subscriber.next(event));
          },
          error: (err) => {
            zone.run(() => subscriber.error(err));
          },
          complete: () => {
            zone.run(() => subscriber.complete());
          },
        });
      });
    }),
    catchError((refreshErr) => {
      return handleLogout(auth, router, zone, refreshErr);
    }),
    finalize(() => {
      // রিফ্রেশিং স্টপ করুন অ্যাঙ্গুলার জোনের ভেতরে
      zone.run(() => auth.isRefreshing$.next(false));
    })
  );
}

/**
 * লগআউট এবং নেভিগেশন হ্যান্ডেলার
 */
function handleLogout(auth: any, router: Router, zone: NgZone, error: any): Observable<never> {
  zone.run(() => {
    auth.logoutClientSide();
    router.navigateByUrl('/login');
  });
  return throwError(() => error);
}

/**
 * রিকোয়েস্টে টোকেন যোগ করার হেল্পার
 */
function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}