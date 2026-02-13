import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, filter, map, startWith } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

import { NavigationService } from '../../../core/services/navigation.service';
import { ErpModule, MenuTreeNode } from '../../../core/models/navigation.models';
import { ActiveModule } from '../../../core/models/active-module.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule
  ],
})
export class SidebarComponent {
  searchText = '';

  private readonly searchTextSubject = new BehaviorSubject<string>('');
  readonly searchText$ = this.searchTextSubject.asObservable();

  modules$: Observable<ErpModule[]> = this.nav.getModules();
  activeModule$: Observable<ActiveModule | null> = this.nav.activeModule$;
  menuTree$: Observable<MenuTreeNode[]> = this.nav.sidebarMenu$;
  loading$: Observable<boolean> = this.nav.sidebarLoading$;

  // ✅ active route highlight
  currentUrl$: Observable<string> = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map(() => this.router.url),
    startWith(this.router.url)
  );

  filteredMenus$: Observable<MenuTreeNode[]> = combineLatest([
    this.menuTree$,
    this.activeModule$,
    this.searchText$.pipe(startWith(''))
  ]).pipe(
    map(([menus, active, search]) => {
      if (!active) return [];
      const term = (search ?? '').toLowerCase().trim();
      if (!term) return menus;

      return (menus || []).filter(m =>
        (m.title ?? '').toLowerCase().includes(term) ||
        (m.subMenus ?? []).some(sm => (sm.title ?? '').toLowerCase().includes(term))
      );
    })
  );

  constructor(
    private nav: NavigationService,
    private router: Router
  ) {}

  onSearchChange(value: string) {
    this.searchText = value ?? '';
    this.searchTextSubject.next(this.searchText);
  }

  selectModule(m: ErpModule) {
    this.nav.setActiveModule(m);
    this.router.navigateByUrl(m.defaultRoute || '/landing');
  }

  clearModule() {
    this.nav.clearActiveModule();
    this.router.navigateByUrl('/landing');
  }

  goRoute(route: string | null | undefined) {
    if (!route) return;
    this.router.navigateByUrl(route);
  }

  // ✅ Angular template-safe: hide image if not found
  onLogoError(evt: Event) {
    const img = evt.target as HTMLImageElement | null;
    if (img) img.style.display = 'none';
  }

  // ✅ DB icon class support:
  // - "nav-icon fas fa-file" => NOT material => <i class="..."></i>
  // - "settings" => material => <mat-icon>settings</mat-icon>
  isMaterialIcon(icon: string | null | undefined): boolean {
    if (!icon) return false;
    return !icon.includes(' ') && !icon.includes('fa') && !icon.includes('fas');
  }

  // ✅ Active match helper (case-insensitive safe)
  isActiveRoute(currentUrl: string, route: string | null | undefined): boolean {
    if (!route) return false;
    const cur = (currentUrl || '').toLowerCase();
    const r = (route || '').toLowerCase();
    return cur === r || cur.startsWith(r + '/');
  }
}
