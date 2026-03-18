import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonComponent, UiCardComponent } from '../../../../shared/ui';

@Component({
  selector: 'app-prl-dashboard-page',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, UiCardComponent],
  templateUrl: './prl-dashboard-page.component.html',
  styleUrl: './prl-dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrlDashboardPageComponent {
  readonly stats = [
    { label: 'Payroll run', value: 'Mar 2026' },
    { label: 'Pending approvals', value: '08' },
    { label: 'Processed employees', value: '214' },
  ];
}
