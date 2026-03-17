import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';

import { UserService } from '../../../core/services/user.service';
import {
  AdminUser,
  AdminUserApiResult,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '../models/admin-user.model';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly users = inject(UserService);

  getAll(): Observable<AdminUser[]> {
    return this.users.getUsers().pipe(map((res) => this.readArray<AdminUser>(res)));
  }

  getById(id: string): Observable<AdminUser> {
    return this.users.getUserById(id).pipe(map((res) => this.readOne<AdminUser>(res) as AdminUser));
  }

  create(payload: CreateAdminUserPayload): Observable<AdminUser> {
    return this.users.createUser(payload).pipe(
      switchMap((res) => {
        const createdId = this.readOne<string>(res);
        if (createdId) {
          return this.getById(createdId);
        }
        return this.getAll().pipe(map((list) => list[0]));
      })
    );
  }

  update(id: string, payload: UpdateAdminUserPayload): Observable<void> {
    return this.users.updateUser(id, payload).pipe(map(() => void 0));
  }

  delete(id: string): Observable<void> {
    return this.users.deleteUser(id).pipe(map(() => void 0));
  }

  private readArray<T>(res: AdminUserApiResult<T[]> | null | undefined): T[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.data ?? res.Data ?? [];
  }

  private readOne<T>(res: AdminUserApiResult<T> | null | undefined): T | null {
    if (res == null) return null;
    if (typeof res === 'object' && ('data' in (res as object) || 'Data' in (res as object))) {
      return ((res as { data?: T; Data?: T }).data ?? (res as { data?: T; Data?: T }).Data ?? null) as T | null;
    }
    return res as T;
  }
}
