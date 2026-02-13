import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, startWith } from 'rxjs';

import { BreadcrumbItem } from '../models/breadcrumb.model';
import { NavigationService } from './navigation.service';
import { MenuTreeNode, SubMenuNode } from '../models/navigation.models';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly subject = new BehaviorSubject<BreadcrumbItem[]>([
    { label: 'Home', url: '/landing' },
  ]);

  readonly breadcrumbs$ = this.subject.asObservable();

  constructor(private router: Router, private nav: NavigationService) {
    const url$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    );

    combineLatest([url$, this.nav.activeModule$, this.nav.sidebarMenu$]).subscribe(
      ([url, activeModule, tree]) => {
        const crumbs: BreadcrumbItem[] = [];

        // Home
        crumbs.push({ label: 'Home', url: '/landing' });

        // Selected Module
        if (activeModule) {
          crumbs.push({
            label: activeModule.name || 'Selected Module',
            url: activeModule.defaultRoute || '/landing',
          });
        }

        // Menu > SubMenu
        const match = this.findMatch(tree || [], url);

        if (match?.menu) {
          crumbs.push({
            label: match.menu.title,
            url: match.menu.route || undefined,
          });
        }

        if (match?.subMenu) {
          crumbs.push({
            label: match.subMenu.title,
            url: match.subMenu.route || undefined,
          });
        }

        this.subject.next(crumbs);
      }
    );
  }

  private findMatch(
    tree: MenuTreeNode[],
    url: string
  ): { menu?: MenuTreeNode; subMenu?: SubMenuNode } | null {
    const current = (url || '').toLowerCase();

    for (const menu of tree) {
      // ✅ Prefer submenu match first (more specific)
      for (const sm of menu.subMenus || []) {
        const smRoute = (sm.route || '').toLowerCase();
        if (smRoute && current.startsWith(smRoute)) {
          return { menu, subMenu: sm };
        }
      }

      // then menu match
      const menuRoute = (menu.route || '').toLowerCase();
      if (menuRoute && current.startsWith(menuRoute)) {
        return { menu };
      }
    }

    return null;
  }
}
