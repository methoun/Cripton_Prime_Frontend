import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { ApiService } from './api.service';
import { TokenStorageService } from './token-storage.service';

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

  public isLoggedIn(): boolean {
    const accessToken = this.tokens.getAccessToken();
    const refreshToken = this.tokens.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return false;
    }

    if (!this.isJwt(accessToken)) {
      this.tokens.clearAll();
      return false;
    }

    if (this.isTokenExpired(accessToken)) {
      this.tokens.clearAll();
      return false;
    }

    return true;
  }

  public login(payload: LoginRequest): Observable<void> {
    return this.api.post<ApiResult<TokenPairDto>>('/api/auth/login', payload).pipe(
      map((res) => this.extractTokenPairOrThrow(res, 'Login failed')),
      tap((pair) => this.persistTokens(pair)),
      map(() => void 0)
    );
  }

  public refresh(): Observable<boolean> {
    const refreshToken = this.tokens.getRefreshToken();
    if (!refreshToken) {
      return of(false);
    }

    return this.api.post<ApiResult<TokenPairDto>>('/api/auth/refresh', { refreshToken }).pipe(
      map((res) => this.extractTokenPair(res)),
      tap((pair) => {
        if (pair) {
          this.persistTokens(pair);
        }
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
  }

  private persistTokens(pair: TokenPairDto): void {
    this.tokens.setTokens({
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken
    });
  }

  private extractTokenPair(res: ApiResult<TokenPairDto> | null | undefined): TokenPairDto | null {
    if (!res) {
      return null;
    }

    if ('success' in res) {
      if (!res.success) {
        return null;
      }

      const data = res.data as TokenPairDto | null | undefined;
      if (!data?.accessToken || !data?.refreshToken) {
        return null;
      }

      return { accessToken: data.accessToken, refreshToken: data.refreshToken };
    }

    if ('isSuccess' in res) {
      if (!res.isSuccess) {
        return null;
      }

      const value = res.value as TokenPairDto | null | undefined;
      if (!value?.accessToken || !value?.refreshToken) {
        return null;
      }

      return { accessToken: value.accessToken, refreshToken: value.refreshToken };
    }

    return null;
  }

  private extractTokenPairOrThrow(res: ApiResult<TokenPairDto> | null | undefined, fallbackMsg: string): TokenPairDto {
    const pair = this.extractTokenPair(res);
    if (pair) {
      return pair;
    }

    const msg =
      (res && 'message' in res && res.message) ||
      (res && 'error' in res && res.error) ||
      fallbackMsg;

    throw new Error(String(msg));
  }

  private isJwt(token: string | null): boolean {
    if (!token) {
      return false;
    }

    const parts = token.split('.');
    return parts.length === 3;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson) as { exp?: number };

      if (!payload.exp) {
        return true;
      }

      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      return payload.exp < currentTimeInSeconds;
    } catch {
      return true;
    }
  }

  private toReadableError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return err.error?.message ?? err.message ?? 'HTTP error';
    }

    return (err as { message?: string } | null | undefined)?.message ?? 'Unknown error';
  }
}
