import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';

import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';
import { LandingPageComponent } from './features/administration/pages/landing-page/landing-page.component';
import { AppShellComponent } from './shared/components/app-shell/app-shell.component';

import { AdministrationDashboardPageComponent } from './features/administration/pages/administration-dashboard-page/administration-dashboard-page.component';
import { AdministrationUsersPageComponent } from './features/administration/pages/administration-users-page/administration-users-page.component';
import { HrmDashboardPageComponent } from './features/hrm/pages/hrm-dashboard-page/hrm-dashboard-page.component';
import { PrlDashboardPageComponent } from './features/prl/pages/prl-dashboard-page/prl-dashboard-page.component';

import { NotFoundPageComponent } from './shared/pages/not-found-page/not-found-page.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [NoAuthGuard],
    component: LoginPageComponent
  },
  {
    path: '',
    canActivate: [authGuard],
    component: AppShellComponent,
    children: [
      { path: 'landing', component: LandingPageComponent },

      // ✅ DB module routes (home/dashboard)
      { path: 'admin', component: AdministrationDashboardPageComponent },
      { path: 'hrm', component: HrmDashboardPageComponent },
      { path: 'prl', component: PrlDashboardPageComponent },

      // existing routes (keep)
      { path: 'administration/dashboard', component: AdministrationDashboardPageComponent },
      { path: 'administration/users', component: AdministrationUsersPageComponent },

      { path: 'hrm/dashboard', component: HrmDashboardPageComponent },
      { path: 'prl/dashboard', component: PrlDashboardPageComponent },

      { path: '', pathMatch: 'full', redirectTo: 'landing' },

      // ✅ child wildcard
      { path: '**', component: NotFoundPageComponent }
    ]
  },

  { path: '**', redirectTo: 'landing' }
];
