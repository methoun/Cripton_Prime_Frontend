import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { UserService } from '../../../core/services/user.service';
import { AdminUser, CreateAdminUserPayload } from '../models/admin-user.model';

/**
 * Administration Feature Service
 * - Core/UserService কে wrap করে
 * - structure clean রাখে
 */
@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly users = inject(UserService);

  /** Existing backend: POST /api/users/create */
  create(payload: CreateAdminUserPayload): Observable<AdminUser> {
    return this.users.createUser(payload as any).pipe(
      map((res: any) => res?.data as AdminUser)
    );
  }
}
