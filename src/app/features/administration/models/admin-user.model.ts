import { ApiResult } from '../../../core/models/api-result.model';

/** Administration -> User Setup models (Feature scoped) */
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string | null;
  isActive: boolean;
}

export interface CreateAdminUserPayload {
  username: string;
  email: string;
  password: string;
  role: string | null;
}

export interface UpdateAdminUserPayload {
  username: string;
  email: string;
  password?: string | null;
  role: string | null;
  isActive: boolean;
}

export type AdminUserApiResult<T> = ApiResult<T> | T;
