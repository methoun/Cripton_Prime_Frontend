import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly api = inject(ApiService);

  public check(): Observable<{ status: string }> {
    return this.api.get<{ status: string }>('/api/health');
  }
}
