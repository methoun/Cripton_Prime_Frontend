import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  ApiResult,
  AdmCompanyInfo,
  SaveAdmCompanyInfoRequest,
  UpdateAdmCompanyInfoRequest
} from '../models/adm-company-info.model';

@Injectable({ providedIn: 'root' })
export class AdmCompanyInfoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/administration/company-setup/adm-company-info';

  getAll(): Observable<AdmCompanyInfo[]> {
    return this.http.get<ApiResult<AdmCompanyInfo[]> | AdmCompanyInfo[]>(this.baseUrl).pipe(
      map((response) => Array.isArray(response)
        ? response
        : (response.data ?? response.Data ?? response.result ?? response.Result ?? []))
    );
  }

  getById(id: string): Observable<AdmCompanyInfo | null> {
    return this.http.get<ApiResult<AdmCompanyInfo> | AdmCompanyInfo>(`${this.baseUrl}/${id}`).pipe(
      map((response) => this.unwrapSingle(response))
    );
  }

  create(payload: SaveAdmCompanyInfoRequest): Observable<unknown> {
    return this.http.post(this.baseUrl, payload);
  }

  update(payload: UpdateAdmCompanyInfoRequest): Observable<unknown> {
    return this.http.put(this.baseUrl, payload);
  }

  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  private unwrapSingle(
    response: ApiResult<AdmCompanyInfo> | AdmCompanyInfo | null | undefined
  ): AdmCompanyInfo | null {
    if (!response) return null;
    if (typeof response === 'object' && !Array.isArray(response)) {
      const apiResponse = response as ApiResult<AdmCompanyInfo>;
      return apiResponse.data
        ?? apiResponse.Data
        ?? apiResponse.result
        ?? apiResponse.Result
        ?? (response as AdmCompanyInfo);
    }
    return response as AdmCompanyInfo;
  }
}
