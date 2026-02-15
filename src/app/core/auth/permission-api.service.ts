import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { PermissionPayloadDto } from '../state/permission-state.service';

// Same envelope type as your AuthService
type ApiResult<T> =
  | { success: boolean; data: T; message?: string | null }
  | { isSuccess: boolean; value: T; error?: string | null };

@Injectable({ providedIn: 'root' })
export class PermissionApiService {
  private readonly api = inject(ApiService);

  /**
   * ✅ You must point to your real endpoint:
   * Example: '/api/auth/permissions' or '/api/permissions/me'
   */
  loadMyPermissions(): Observable<PermissionPayloadDto> {
    return this.api.get<ApiResult<PermissionPayloadDto>>('/api/auth/permissions').pipe(
      map((res) => this.extractOrThrow(res, 'Failed to load permissions'))
    );
  }

  private extractOrThrow(res: ApiResult<PermissionPayloadDto> | null | undefined, fallbackMsg: string): PermissionPayloadDto {
    if (!res) throw new Error(fallbackMsg);

    if ('success' in res) {
      if (!res.success) throw new Error(String(res.message ?? fallbackMsg));
      return res.data as PermissionPayloadDto;
    }

    if ('isSuccess' in res) {
      if (!res.isSuccess) throw new Error(String(res.error ?? fallbackMsg));
      return (res as any).value as PermissionPayloadDto;
    }

    throw new Error(fallbackMsg);
  }
}
