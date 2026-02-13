import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, combineLatest, map, startWith } from 'rxjs';

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

  // Always Observable
  modules$: Observable<ErpModule[]> = this.nav.getModules();
  activeModule$: Observable<ActiveModule | null> = this.nav.activeModule$;
  menuTree$: Observable<MenuTreeNode[]> = this.nav.sidebarMenu$;

  // filteredMenus observable (no function call in html)
  filteredMenus$: Observable<MenuTreeNode[]> = combineLatest([
    this.menuTree$,
    this.activeModule$,
    this.searchTextChange$()
  ]).pipe(
    map(([menus, active, search]) => {
      if (!active) return [];
      const term = (search ?? '').toLowerCase().trim();
      if (!term) return menus;

      return menus.filter(m =>
        (m.title ?? '').toLowerCase().includes(term) ||
        (m.subMenus ?? []).some(sm => (sm.title ?? '').toLowerCase().includes(term))
      );
    })
  );

  constructor(
    private nav: NavigationService,
    private router: Router
  ) {}

  private searchTextChange$(): Observable<string> {
    return new Observable<string>(observer => {
      observer.next(this.searchText);

      const interval = setInterval(() => {
        observer.next(this.searchText);
      }, 200);

      return () => clearInterval(interval);
    }).pipe(startWith(''));
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

  isMaterialIcon(icon: string | null | undefined): boolean {
    if (!icon) return false;
    return !icon.includes(' ') && !icon.includes('fa') && !icon.includes('fas');
  }
}
