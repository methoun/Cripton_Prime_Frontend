import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';

import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { BreadcrumbItem } from '../../../core/models/breadcrumb.model';
import { ActiveModule } from '../../../core/models/active-module.model';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  breadcrumbs$: Observable<BreadcrumbItem[]> = this.breadcrumbs.breadcrumbs$;
  activeModule$: Observable<ActiveModule | null> = this.nav.activeModule$;

  constructor(
    private breadcrumbs: BreadcrumbService,
    private nav: NavigationService,
    private router: Router
  ) {}

  onCrumbClick(item: BreadcrumbItem, index: number, active: ActiveModule | null, event: MouseEvent) {
    event.preventDefault();

    // ✅ Home click: landing + clear module context
    if (index === 0) {
      this.nav.clearActiveModule();
      this.router.navigateByUrl('/landing');
      return;
    }

    // ✅ Module click: reload tree + navigate to module default route
    if (index === 1 && active) {
      this.nav.reloadActiveModuleTree();
      this.router.navigateByUrl(active.defaultRoute || '/landing');
      return;
    }

    // ✅ Other crumbs (menu/submenu)
    if (item.url) {
      this.router.navigateByUrl(item.url);
    }
  }

  trackByIndex(i: number) {
    return i;
  }
}
