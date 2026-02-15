import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, filter, map, startWith } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    RouterModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatTooltipModule
  ],
})
export class SidebarComponent {
  @Input() collapsed = false;

  /** ✅ header search -> reactive */
  private readonly searchTextSubject = new BehaviorSubject<string>('');
  readonly searchText$ = this.searchTextSubject.asObservable();

  /** ✅ this is what AppShell binds: [searchText]="headerSearch" */
  @Input() set searchText(v: string) {
    this.searchTextSubject.next((v ?? '').toLowerCase().trim());
  }

  modules$: Observable<ErpModule[]> = this.nav.getModules();
  activeModule$: Observable<ActiveModule | null> = this.nav.activeModule$;
  menuTree$: Observable<MenuTreeNode[]> = this.nav.sidebarMenu$;
  loading$: Observable<boolean> = this.nav.sidebarLoading$;

  /** ✅ active route highlight */
  currentUrl$: Observable<string> = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map(() => this.router.url),
    startWith(this.router.url)
  );

  /** ✅ Flyout state (collapsed mode) */
  flyoutOpen = false;
  flyoutTitle = '';
  flyoutItems: { title: string; route?: string | null }[] = [];

  /** ✅ Module search (activeModule null থাকলে module list filter হবে) */
  filteredModules$: Observable<ErpModule[]> = combineLatest([
    this.modules$,
    this.searchText$.pipe(startWith(''))
  ]).pipe(
    map(([mods, term]) => {
      const t = (term ?? '').trim();
      if (!t) return mods || [];
      return (mods || []).filter(m =>
        ((m.name ?? '') + ' ' + (m.defaultRoute ?? '')).toLowerCase().includes(t)
      );
    })
  );

  /** ✅ Menu + Submenu search */
  filteredMenus$: Observable<MenuTreeNode[]> = combineLatest([
    this.menuTree$,
    this.activeModule$,
    this.searchText$.pipe(startWith(''))
  ]).pipe(
    map(([menus, active, term]) => {
      if (!active) return [];

      const t = (term ?? '').trim();
      if (!t) return menus || [];

      return (menus || [])
        .map(m => ({
          ...m,
          subMenus: (m.subMenus || []).filter(sm =>
            ((sm.title ?? '') + ' ' + (sm.route ?? '')).toLowerCase().includes(t)
          )
        }))
        .filter(m => {
          const mHit = ((m.title ?? '') + ' ' + (m.route ?? '')).toLowerCase().includes(t);
          const smHit = (m.subMenus ?? []).length > 0;
          return mHit || smHit;
        });
    })
  );

  constructor(
    private nav: NavigationService,
    private router: Router,
    private host: ElementRef<HTMLElement>
  ) {}

  selectModule(m: ErpModule) {
    this.nav.setActiveModule(m);
    this.router.navigateByUrl(m.defaultRoute || '/landing');
  }

  clearModule() {
    this.nav.clearActiveModule();
    this.closeFlyout();
    this.router.navigateByUrl('/landing');
  }

  goRoute(route: string | null | undefined) {
    if (!route) return;
    this.closeFlyout();
    this.router.navigateByUrl(route);
  }

  /** ✅ Collapsed mode: menu click -> open flyout */
  openFlyout(menu: MenuTreeNode): void {
    if (!this.collapsed) return;

    this.flyoutTitle = menu.title || '';
    const subs = (menu.subMenus ?? []).map(sm => ({ title: sm.title || '', route: sm.route }));
    const asSelf =
      menu.route && (!menu.subMenus || menu.subMenus.length === 0)
        ? [{ title: menu.title || '', route: menu.route }]
        : [];

    this.flyoutItems = [...asSelf, ...subs];
    this.flyoutOpen = true;
  }

  closeFlyout(): void {
    this.flyoutOpen = false;
    this.flyoutTitle = '';
    this.flyoutItems = [];
  }

  /** ✅ Click outside => close flyout */
  @HostListener('document:mousedown', ['$event'])
  onDocDown(ev: MouseEvent): void {
    if (!this.flyoutOpen) return;
    const root = this.host.nativeElement;
    const target = ev.target as Node | null;
    if (target && !root.contains(target)) this.closeFlyout();
  }

  onLogoError(evt: Event) {
    const img = evt.target as HTMLImageElement | null;
    if (img) img.style.display = 'none';
  }

  isMaterialIcon(icon: string | null | undefined): boolean {
    if (!icon) return false;
    return !icon.includes(' ') && !icon.includes('fa') && !icon.includes('fas');
  }

  isActiveRoute(currentUrl: string, route: string | null | undefined): boolean {
    if (!route) return false;
    const cur = (currentUrl || '').toLowerCase();
    const r = (route || '').toLowerCase();
    return cur === r || cur.startsWith(r + '/');
  }
}
