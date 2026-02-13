import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

function isJwt(token: string | null): boolean {
  if (!token) {
    return false;
  }
  const parts = token.split('.');
  return parts.length === 3;
}

export const authGuard: CanActivateFn = () => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);

  const access = storage.getAccessToken();
  const refresh = storage.getRefreshToken();

  if (isJwt(access) && Boolean(refresh)) {
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};
