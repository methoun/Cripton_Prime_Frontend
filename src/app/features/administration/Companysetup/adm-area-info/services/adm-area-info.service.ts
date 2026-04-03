import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  ApiResult,
  AdmAreaInfo,
  SaveAdmAreaInfoRequest,
  UpdateAdmAreaInfoRequest
} from '../models/adm-area-info.model';

@Injectable({ providedIn: 'root' })
export class AdmAreaInfoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/administration/company-setup/adm-area-info';

  getAll(): Observable<AdmAreaInfo[]> {
    return this.http.get<ApiResult<AdmAreaInfo[]> | AdmAreaInfo[]>(this.baseUrl).pipe(
      map((response) => Array.isArray(response)
        ? response
        : (response.data ?? response.Data ?? response.result ?? response.Result ?? []))
    );
  }

  getById(id: string): Observable<AdmAreaInfo | null> {
    return this.http.get<ApiResult<AdmAreaInfo> | AdmAreaInfo>(`${this.baseUrl}/${id}`).pipe(
      map((response) => this.unwrapSingle(response))
    );
  }

  create(payload: SaveAdmAreaInfoRequest): Observable<unknown> {
    return this.http.post(this.baseUrl, payload);
  }

  update(payload: UpdateAdmAreaInfoRequest): Observable<unknown> {
    return this.http.put(this.baseUrl, payload);
  }

  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  private unwrapSingle(
    response: ApiResult<AdmAreaInfo> | AdmAreaInfo | null | undefined
  ): AdmAreaInfo | null {
    if (!response) return null;
    if (typeof response === 'object' && !Array.isArray(response)) {
      const apiResponse = response as ApiResult<AdmAreaInfo>;
      return apiResponse.data
        ?? apiResponse.Data
        ?? apiResponse.result
        ?? apiResponse.Result
        ?? (response as AdmAreaInfo);
    }
    return response as AdmAreaInfo;
  }
}
