import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavigationService } from '../../../../core/services/navigation.service';
import { UiButtonComponent, UiCanDirective, UiCardComponent } from '../../../../shared/ui';

@Component({
  selector: 'app-administration-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink, UiCardComponent, UiButtonComponent, UiCanDirective],
  templateUrl: './administration-dashboard-page.component.html',
  styleUrl: './administration-dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministrationDashboardPageComponent {
  private readonly navigation = inject(NavigationService);
  public readonly activeModule$ = this.navigation.activeModule$;

  readonly statCards = [
    { label: 'Active Users', value: '128', tone: 'primary', icon: 'group' },
    { label: 'Open Roles', value: '12', tone: 'accent', icon: 'admin_panel_settings' },
    { label: 'Pending Requests', value: '07', tone: 'warning', icon: 'pending_actions' },
    { label: 'Policies Updated', value: '03', tone: 'success', icon: 'verified' },
  ];
}
