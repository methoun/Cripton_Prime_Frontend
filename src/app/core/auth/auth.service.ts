import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, switchMap } from 'rxjs';

import { ApiService } from './api.service';
import { TokenStorageService } from './token-storage.service';
import { PermissionApiService } from './permission-api.service';
import { PermissionStateService } from '../state/permission-state.service';

// ✅ Backend might return either:
// A) { success: boolean; data: T; message?: string }
// B) { isSuccess: boolean; value: T; error?: string }
type ApiResult<T> =
  | { success: boolean; data: T; message?: string | null }
  | { isSuccess: boolean; value: T; error?: string | null };

export interface LoginRequest {
  company: string;
  office: string;
  username: string;
  password: string;
}

export interface TokenPairDto {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly tokens = inject(TokenStorageService);

  private readonly permissionApi = inject(PermissionApiService);
  private readonly permissionState = inject(PermissionStateService);

  public isLoggedIn(): boolean {
    return !!this.tokens.getAccessToken();
  }

  public login(payload: LoginRequest): Observable<void> {
    return this.api.post<ApiResult<TokenPairDto>>('/api/auth/login', payload).pipe(
      map((res) => this.extractTokenPairOrThrow(res, 'Login failed')),
      tap((pair) => this.persistTokens(pair)),

      // ✅ IMPORTANT: login এর পর permissions load করে persist করো
      switchMap(() => this.permissionApi.loadMyPermissions()),
      tap((permissions) => this.permissionState.setPermissions(permissions)),

      map(() => void 0)
    );
  }

  public refresh(): Observable<boolean> {
    const refreshToken = this.tokens.getRefreshToken();
    if (!refreshToken) return of(false);

    return this.api.post<ApiResult<TokenPairDto>>('/api/auth/refresh', { refreshToken }).pipe(
      map((res) => this.extractTokenPair(res)),
      tap((pair) => {
        if (pair) this.persistTokens(pair);
      }),
      map((pair) => !!pair),
      catchError(() => of(false))
    );
  }

  public logout(): Observable<void> {
    return this.api.post<unknown>('/api/auth/logout', {}).pipe(
      tap(() => this.logoutClientSide()),
      map(() => void 0),
      catchError(() => {
        this.logoutClientSide();
        return of(void 0);
      })
    );
  }

  public logoutClientSide(): void {
    this.tokens.clearAll();
    this.permissionState.clearAll(); // ✅ sidebar vanish bug prevent + clean logout
  }

  private persistTokens(pair: TokenPairDto): void {
    this.tokens.setTokens({
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken
    });
  }

  // -------- helpers --------

  private extractTokenPair(res: ApiResult<TokenPairDto> | null | undefined): TokenPairDto | null {
    if (!res) return null;

    // A) { success, data }
    if ('success' in res) {
      if (!res.success) return null;
      const data = res.data as any;
      if (!data?.accessToken || !data?.refreshToken) return null;
      return { accessToken: data.accessToken, refreshToken: data.refreshToken };
    }

    // B) { isSuccess, value }
    if ('isSuccess' in res) {
      if (!res.isSuccess) return null;
      const val = (res as any).value;
      if (!val?.accessToken || !val?.refreshToken) return null;
      return { accessToken: val.accessToken, refreshToken: val.refreshToken };
    }

    return null;
  }

  private extractTokenPairOrThrow(res: ApiResult<TokenPairDto> | null | undefined, fallbackMsg: string): TokenPairDto {
    const pair = this.extractTokenPair(res);
    if (pair) return pair;

    const msg =
      (res && 'message' in res && (res as any).message) ||
      (res && 'error' in res && (res as any).error) ||
      fallbackMsg;

    throw new Error(String(msg));
  }

  // optional debug helper
  private toReadableError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return err.error?.message ?? err.message ?? 'HTTP error';
    }
    return (err as any)?.message ?? 'Unknown error';
  }
}
