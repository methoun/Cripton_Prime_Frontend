import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, switchMap, BehaviorSubject, finalize } from 'rxjs';
import { ApiService } from '../services/api.service';
import { TokenStorageService } from '../services/token-storage.service';
import { PermissionApiService } from './permission-api.service';
import { PermissionStateService } from '../state/permission-state.service';

type ApiResult<T> = | { success: boolean; data: T; message?: string | null } | { isSuccess: boolean; value: T; error?: string | null };
export interface TokenPairDto { accessToken: string; refreshToken: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  public isRefreshing$ = new BehaviorSubject<boolean>(false);
  public refreshToken$ = new BehaviorSubject<string | null>(null);

  private readonly api = inject(ApiService);
  private readonly tokens = inject(TokenStorageService);
  private readonly permissionApi = inject(PermissionApiService);
  private readonly permissionState = inject(PermissionStateService);

  public isLoggedIn(): boolean { return !!this.tokens.getAccessToken(); }

  public login(payload: any): Observable<void> {
    return this.api.post<ApiResult<TokenPairDto>>('/api/auth/login', payload).pipe(
      map(res => {
        const pair = this.extractTokenPair(res);
        if (!pair) throw new Error('Login failed');
        return pair;
      }),
      tap(pair => this.persistTokens(pair)),
      switchMap(() => this.permissionApi.loadMyPermissions()),
      tap(perms => this.permissionState.setPermissions(perms)),
      map(() => void 0)
    );
  }

public refresh(): Observable<boolean> {
  const rf = this.tokens.getRefreshToken();
  if (!rf) return of(false);

  return this.api.post<any>('/api/auth/refresh', { refreshToken: rf }).pipe(
    map(res => {
      const data = res?.data || res?.value;
      if (data?.accessToken && data?.refreshToken) {
        this.persistTokens(data);
        // ✅ CRITICAL: This line releases the "Loading" lock for all waiting calls
        this.refreshToken$.next(data.accessToken); 
        return true;
      }
      return false;
    }),
    catchError(() => {
      this.logoutClientSide();
      return of(false);
    })
  );
}

  public logoutClientSide(): void {
    this.tokens.clearAll();
    this.permissionState.clearAll();
    this.isRefreshing$.next(false);
    this.refreshToken$.next(null);
  }

  private persistTokens(p: TokenPairDto): void {
    this.tokens.setTokens({ accessToken: p.accessToken, refreshToken: p.refreshToken });
  }

  private extractTokenPair(res: any): TokenPairDto | null {
    const data = res?.data || res?.value;
    return (data?.accessToken && data?.refreshToken) ? data : null;
  }
}