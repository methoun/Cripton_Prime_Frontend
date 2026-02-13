import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { NavigationService } from '../services/navigation.service';

export const moduleContextGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const nav = inject(NavigationService);
  const router = inject(Router);

  const moduleId = (route.paramMap.get('moduleId') ?? '').toString().trim();
  if (!moduleId) return router.parseUrl('/landing');

  // 1) set active module from moduleId (loads modules if needed)
  // 2) load tree for that moduleId
  // 3) redirect to module.defaultRoute
  return nav.setActiveModuleById(moduleId).pipe(
    take(1),
    switchMap(active => {
      if (!active) return of(router.parseUrl('/landing') as UrlTree);

      return nav.getNavigationTree(active.moduleId).pipe(
        take(1),
        map(() => router.parseUrl(active.defaultRoute || '/landing')),
        catchError(() => of(router.parseUrl(active.defaultRoute || '/landing')))
      );
    }),
    catchError(() => of(router.parseUrl('/landing')))
  );
};
