import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  private getBaseUrl(): string {
    const baseUrl = environment.apiBaseUrl ?? '';
    return baseUrl;
  }

  public get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    const url = this.buildUrl(path);
    const httpParams = this.buildParams(params);
    return this.http.get<T>(url, { params: httpParams });
  }

  public post<T>(path: string, body: unknown): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.post<T>(url, body);
  }

  public postWithHeaders<T>(path: string, body: unknown, headers: HttpHeaders): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.post<T>(url, body, { headers });
  }

  private buildUrl(path: string): string {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) {
      return path;
    }
    return `${baseUrl}${path}`;
  }

  private buildParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }

    Object.entries(params).forEach(([key, value]) => {
      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }
}
