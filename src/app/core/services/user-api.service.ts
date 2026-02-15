import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserContext } from '../models/user-context.model';

type ApiResult<T> = { success?: boolean; Success?: boolean; data?: T; Data?: T };

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly api = (environment.apiBaseUrl || '').replace(/\/+$/, '');
  private readonly meUrl = `${this.api}/api/auth/me`; 

  constructor(private http: HttpClient) {}

  getMe(): Observable<UserContext | null> {
    return this.http.get<ApiResult<any>>(this.meUrl).pipe(
      map(res => {
        const ok = (res?.success ?? res?.Success) === true;
        if (!ok) return null;

        const u = (res?.data ?? res?.Data) ?? null;
        if (!u) return null;

        const ctx: UserContext = {
          userId: String(u.userId ?? u.UserId ?? ''),
          userName: String(u.userName ?? u.UserName ?? u.name ?? u.Name ?? ''),
          userRole: String(u.role ?? u.Role ?? u.userRole ?? u.UserRole ?? '') || null,

          companyId: String(u.companyId ?? u.CompanyId ?? ''),
          companyName: String(u.companyName ?? u.CompanyName ?? ''),

          areaId: String(u.areaId ?? u.AreaId ?? '') || null,
          areaName: String(u.areaName ?? u.AreaName ?? '') || null,

          userImageUrl: (u.userImageUrl ?? u.UserImageUrl ?? null),
          loginTimeIso: String(u.loginTimeIso ?? u.LoginTimeIso ?? '') || null,
          ipAddress: String(u.ipAddress ?? u.IpAddress ?? '') || null,
        };

        return ctx.userId && ctx.userName ? ctx : null;
      }),
      catchError(err => {
        console.error('GET /me ERROR =>', err);
        return of(null);
      })
    );
  }
}
