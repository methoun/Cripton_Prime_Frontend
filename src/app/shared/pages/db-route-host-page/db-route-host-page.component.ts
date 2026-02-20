import { Component, ChangeDetectionStrategy, inject, Type, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

import { NotFoundPageComponent } from '../not-found-page/not-found-page.component';
import { ROUTE_MANIFEST } from '../../../core/routing/routes.generated';

@Component({
  selector: 'app-db-route-host-page',
  standalone: true,
  imports: [CommonModule, NotFoundPageComponent],
  template: `
    @if (loading()) {
      <div class="wrap">Loading page...</div>
    } @else if (cmp()) {
      <ng-container *ngComponentOutlet="cmp()"></ng-container>
    } @else {
      <app-not-found-page />
    }
  `,
  styles: [`.wrap { padding: 16px; opacity: .75; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DbRouteHostPageComponent {
  private readonly router = inject(Router);

  loading = signal(true);
  cmp = signal<Type<unknown> | null>(null);

  private resolveToken = 0;

  constructor() {
    this.resolve();

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.resolve());
  }

  private async resolve() {
    const token = ++this.resolveToken;

    this.loading.set(true);
    this.cmp.set(null);

    const url = this.normalizeUrl(this.router.url);

    // ✅ Use base route so "/create" or "/:id/edit" still loads the base page
    const baseRoute = this.extractBaseRoute(url);

    const loader = ROUTE_MANIFEST[baseRoute];

    if (!loader) {
      if (token === this.resolveToken) this.loading.set(false);
      return;
    }

    try {
      const component = (await loader()) as Type<unknown>;
      if (token !== this.resolveToken) return;
      this.cmp.set(component);
    } catch {
      if (token !== this.resolveToken) return;
      this.cmp.set(null);
    } finally {
      if (token === this.resolveToken) this.loading.set(false);
    }
  }

  private normalizeUrl(url: string): string {
    const clean = url.split('?')[0].split('#')[0];
    if (clean.length > 1 && clean.endsWith('/')) return clean.slice(0, -1);
    return clean;
  }

  private extractBaseRoute(url: string): string {
    const parts = url.split('/').filter(Boolean);

    // "/admin", "/hrm" etc.
    if (parts.length <= 3) return '/' + parts.join('/');

    // "/admin/user-setup/user-list/..." => "/admin/user-setup/user-list"
    return '/' + parts.slice(0, 3).join('/');
  }
}