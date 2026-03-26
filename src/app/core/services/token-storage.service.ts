import { Injectable } from '@angular/core';
import { ActiveModule } from '../models/active-module.model';

type TokenPair = { accessToken: string; refreshToken: string };

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly ACCESS_TOKEN_KEY = 'erp_access_token';
  private readonly REFRESH_TOKEN_KEY = 'erp_refresh_token';
  private readonly ACTIVE_MODULE_KEY = 'erp_active_module';

  private get storage(): Storage {
    return sessionStorage;
  }

  setTokens(accessToken: string, refreshToken: string): void;
  setTokens(tokens: TokenPair): void;
  setTokens(a: string | TokenPair, b?: string): void {
    if (typeof a === 'string') {
      this.storage.setItem(this.ACCESS_TOKEN_KEY, a);
      this.storage.setItem(this.REFRESH_TOKEN_KEY, b ?? '');
      return;
    }

    this.storage.setItem(this.ACCESS_TOKEN_KEY, a.accessToken);
    this.storage.setItem(this.REFRESH_TOKEN_KEY, a.refreshToken);
  }

  getAccessToken(): string | null {
    return this.storage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearAll(): void {
    this.storage.removeItem(this.ACCESS_TOKEN_KEY);
    this.storage.removeItem(this.REFRESH_TOKEN_KEY);
    this.storage.removeItem(this.ACTIVE_MODULE_KEY);
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ACTIVE_MODULE_KEY);
  }

  setActiveModule(module: ActiveModule): void {
    this.storage.setItem(this.ACTIVE_MODULE_KEY, JSON.stringify(module));
  }

  getActiveModule(): ActiveModule | null {
    const raw = this.storage.getItem(this.ACTIVE_MODULE_KEY) ?? localStorage.getItem(this.ACTIVE_MODULE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as ActiveModule;
    } catch {
      this.storage.removeItem(this.ACTIVE_MODULE_KEY);
      localStorage.removeItem(this.ACTIVE_MODULE_KEY);
      return null;
    }
  }

  removeActiveModule(): void {
    this.storage.removeItem(this.ACTIVE_MODULE_KEY);
    localStorage.removeItem(this.ACTIVE_MODULE_KEY);
  }
}
