import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, delay } from 'rxjs'; // delay যোগ করতে পারেন টেস্টের জন্য
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
    return this.http.get<any>(this.baseUrl).pipe(
      map((response) => {
        console.log('GET ALL RESPONSE:', response); // এটি চেক করার জন্য
        
        if (Array.isArray(response)) {
          return response;
        }
        
        // API থেকে data, Data, result অথবা Result যেকোনো কি-তে ডাটা আসতে পারে
        const data = response?.data ?? response?.Data ?? response?.result ?? response?.Result;
        
        return Array.isArray(data) ? data : [];
      })
    );
  }

  getById(id: string): Observable<AdmCompanyInfo | null> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
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

  private unwrapSingle(response: any): AdmCompanyInfo | null {
    if (!response) return null;

    // যদি সরাসরি অবজেক্ট হয় (ডাটা প্রপার্টি ছাড়া)
    if (response.compId || response.compName) {
      return response as AdmCompanyInfo;
    }

    // র‍্যাপার প্রপার্টি চেক করা
    const data = response?.data ?? response?.Data ?? response?.result ?? response?.Result;
    return data ?? null;
  }
}