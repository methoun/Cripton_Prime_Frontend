import { Injectable, inject } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { PermissionApiService } from './permission-api.service';
import { PermissionStateService } from '../state/permission-state.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class PermissionBootstrapService {
  private readonly permissionApi = inject(PermissionApiService);
  private readonly permissionState = inject(PermissionStateService);
  private readonly tokens = inject(TokenStorageService);

  /**
   * ✅ App start / refresh এ call হবে
   * - localStorage এ permissions থাকলে restore
   * - না থাকলে token থাকলে backend থেকে fetch করে restore
   */
  init() {
    const restored = this.permissionState.restorePermissionsFromStorage();

    const savedActive = this.permissionState.restoreActiveModuleIdFromStorage();
    if (savedActive !== null) this.permissionState.setActiveModuleId(savedActive);

    // If permission cached, done.
    if (restored) return of(true);

    // If not cached but token exists -> fetch permissions
    if (!this.tokens.getAccessToken()) return of(true);

    return this.permissionApi.loadMyPermissions().pipe(
      tap((p) => this.permissionState.setPermissions(p)),
      map(() => true),
      catchError(() => of(true)) // don't block app startup
    );
  }
}
