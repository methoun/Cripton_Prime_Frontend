import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../models/api-result.model';
import { ApiService } from './api.service';

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string | null;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  password?: string | null;
  role: string | null;
  isActive: boolean;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string | null;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  public createUser(payload: CreateUserRequest): Observable<ApiResult<string> | string> {
    return this.api.post<ApiResult<string> | string>('/api/users/create', payload);
  }

  public getUsers(): Observable<ApiResult<UserDto[]> | UserDto[]> {
    return this.api.get<ApiResult<UserDto[]> | UserDto[]>('/api/users');
  }

  public getUserById(id: string): Observable<ApiResult<UserDto> | UserDto> {
    return this.api.get<ApiResult<UserDto> | UserDto>(`/api/users/${id}`);
  }

  public updateUser(id: string, payload: UpdateUserRequest): Observable<ApiResult<unknown> | unknown> {
    return this.api.put<ApiResult<unknown> | unknown>(`/api/users/${id}`, payload);
  }

  public deleteUser(id: string): Observable<ApiResult<unknown> | unknown> {
    return this.api.delete<ApiResult<unknown> | unknown>(`/api/users/${id}`);
  }
}
