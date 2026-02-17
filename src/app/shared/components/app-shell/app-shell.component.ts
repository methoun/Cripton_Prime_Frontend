import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';

/* ✅ Needed for header search form-field */
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

import { NavigationService } from '../../../core/services/navigation.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { UserApiService } from '../../../core/services/user-api.service';
import { UserContext } from '../../../core/models/user-context.model';

type NotifyItem = { code: string; title: string; subtitle: string };

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,

    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatTabsModule,

    /* ✅ header search */
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,

    SidebarComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
})
export class AppShellComponent implements OnInit {
  sidenavOpened = true;
  userImageUrlFallback = 'https://i.pravatar.cc/80?img=12';

  ctx$: Observable<UserContext | null> = this.userContext.userContext$;

  notifications: NotifyItem[] = [
    { code: 'QUT', title: 'Check Quotation', subtitle: '39 Quotation is pending for check' },
    { code: 'QUT', title: 'Approve Quotation', subtitle: '28 Quotation is pending for approve' },
    { code: 'WO', title: 'Check Work Order', subtitle: '10 Work Order is pending for check' },
  ];

  /* ✅ Header search */
  public headerSearch = '';
  public sidebarCollapsed = false;

  /* ✅ Date text in header */
  public todayText = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date());

  /* ✅ USER MENU EXTRA (for screenshot-style dropdown) */
  public userMenuIp = '0.0.0.0';

  constructor(
    private router: Router,
    private nav: NavigationService,
    private tokens: TokenStorageService,
    private userContext: UserContextService,
    private userApi: UserApiService
  ) {}

  ngOnInit(): void {
    // ✅ App load এ backend থেকে profile/context আনুন
    this.userApi.getMe().subscribe((ctx) => {
      if (ctx) {
        if (!ctx.userImageUrl) ctx.userImageUrl = this.userImageUrlFallback;
        this.userContext.setContext(ctx);

        // ✅ if backend returns ip field, map it here (optional)
        const anyCtx = ctx as any;
        if (anyCtx?.ip) this.userMenuIp = String(anyCtx.ip);
        if (anyCtx?.clientIp) this.userMenuIp = String(anyCtx.clientIp);
      }
    });

    // ✅ HARD REFRESH FIX:
    // active module localStorage এ থাকলে, refresh এর পরে sidebar tree আবার load হবে
    const active = this.tokens.getActiveModule();
    if (active?.moduleId) {
      this.nav.reloadTreeForModule(active.moduleId);
    }

    // ✅ fallback: if you stored ip somewhere
    const ipLocal = localStorage.getItem('client_ip');
    if (ipLocal) this.userMenuIp = ipLocal;
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  goToModules(): void {
    this.nav.clearActiveModule();
    this.router.navigateByUrl('/landing');
  }

  goToProfile(): void {
    this.router.navigateByUrl('/landing'); // later: /profile
  }

  goToChangePassword(): void {
    this.router.navigateByUrl('/landing'); // later: /change-password
  }

  /* ✅ Help route (dropdown) */
  goToHelp(): void {
    this.router.navigateByUrl('/landing'); // later: /help
  }

  onLogout(): void {
    this.tokens.clearAll();
    this.nav.clearActiveModule();
    this.userContext.clear();
    this.router.navigateByUrl('/login');
  }

  public toggleSidebarMode(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  public onHeaderSearch(v: string): void {
    this.headerSearch = (v ?? '').toLowerCase().trim();
  }

  formatLoginTime(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const opts: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Intl.DateTimeFormat(undefined, opts).format(d);
  }
}
