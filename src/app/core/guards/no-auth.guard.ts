import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  public canActivate(): boolean | UrlTree {
    if (this.auth.isLoggedIn()) {
      return this.router.parseUrl('/landing');
    }
    return true;
  }
}
