import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

export interface CreateUserRequest {
  username: string;
  fullName: string;
  email: string;
}

export interface UserDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  public createUser(payload: CreateUserRequest): Observable<UserDto> {
    return this.api.post<UserDto>('/api/users/create', payload);
  }

  public getUser(id: number): Observable<UserDto> {
    return this.api.get<UserDto>(`/api/users/${id}`);
  }
}
