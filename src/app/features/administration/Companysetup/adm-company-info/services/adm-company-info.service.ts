import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import {
  ApiResult,
  AdmCompanyInfo,
  SaveAdmCompanyInfoRequest,
  UpdateAdmCompanyInfoRequest
} from '../models/adm-company-info.model';

@Injectable({ providedIn: 'root' })
export class AdmCompanyInfoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/administration/company-setup/adm-company-info`;

  getAll(): Observable<AdmCompanyInfo[]> {
    return this.http.get<ApiResult<AdmCompanyInfo[]> | AdmCompanyInfo[]>(this.baseUrl).pipe(
      tap((res) => console.log('GET ALL RESPONSE:', res)),
      map((response) =>
        Array.isArray(response)
          ? response
          : (response.data ?? response.Data ?? response.result ?? response.Result ?? [])
      )
    );
  }

  getById(id: string): Observable<AdmCompanyInfo | null> {
    return this.http.get<ApiResult<AdmCompanyInfo> | AdmCompanyInfo>(`${this.baseUrl}/${id}`).pipe(
      tap((res) => console.log('GET BY ID RESPONSE:', res)),
      map((response) => this.unwrapSingle(response))
    );
  }

  create(payload: SaveAdmCompanyInfoRequest): Observable<any> {
    console.log('CREATE URL:', this.baseUrl);
    console.log('CREATE PAYLOAD:', payload);

    return this.http.post<ApiResult<any> | any>(this.baseUrl, payload).pipe(
      tap((res) => console.log('CREATE RESPONSE:', res)),
      map((response) => this.unwrapResponse(response))
    );
  }

  update(payload: UpdateAdmCompanyInfoRequest): Observable<any> {
    console.log('UPDATE URL:', this.baseUrl);
    console.log('UPDATE PAYLOAD:', payload);

    return this.http.put<ApiResult<any> | any>(this.baseUrl, payload).pipe(
      tap((res) => console.log('UPDATE RESPONSE:', res)),
      map((response) => this.unwrapResponse(response))
    );
  }

  delete(id: string): Observable<any> {
    console.log('DELETE URL:', `${this.baseUrl}/${id}`);

    return this.http.delete<ApiResult<any> | any>(`${this.baseUrl}/${id}`).pipe(
      tap((res) => console.log('DELETE RESPONSE:', res)),
      map((response) => this.unwrapResponse(response))
    );
  }

  private unwrapSingle(
    response: ApiResult<AdmCompanyInfo> | AdmCompanyInfo | null | undefined
  ): AdmCompanyInfo | null {
    if (!response) return null;

    if (typeof response === 'object' && !Array.isArray(response)) {
      const apiResponse = response as ApiResult<AdmCompanyInfo>;
      return (
        apiResponse.data ??
        apiResponse.Data ??
        apiResponse.result ??
        apiResponse.Result ??
        (response as AdmCompanyInfo)
      );
    }

    return response as AdmCompanyInfo;
  }

  private unwrapResponse(response: any): any {
    if (!response) return response;

    if (typeof response === 'object') {
      return response.data ?? response.Data ?? response.result ?? response.Result ?? response;
    }

    return response;
  }
}