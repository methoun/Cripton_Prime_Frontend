import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

import { NavigationService } from '../../../core/services/navigation.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,

    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,

    SidebarComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
})
export class AppShellComponent {
  sidenavOpened = true;

  // demo user info (তুমি চাইলে auth/profile থেকে bind করবে)
  userName = 'User';
  userImageUrl = 'https://i.pravatar.cc/80?img=12';

  constructor(
    private router: Router,
    private nav: NavigationService,
    private tokens: TokenStorageService
  ) {}

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  goToModules(): void {
    this.nav.clearActiveModule();
    this.router.navigateByUrl('/landing');
  }

  onLogout(): void {
    this.tokens.clearAll();
    this.nav.clearActiveModule();
    this.router.navigateByUrl('/login');
  }
}
