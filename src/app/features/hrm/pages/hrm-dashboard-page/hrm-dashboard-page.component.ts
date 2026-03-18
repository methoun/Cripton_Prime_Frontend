import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonComponent, UiCardComponent } from '../../../../shared/ui';

@Component({
  selector: 'app-hrm-dashboard-page',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, UiCardComponent],
  templateUrl: './hrm-dashboard-page.component.html',
  styleUrl: './hrm-dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HrmDashboardPageComponent {
  readonly stats = [
    { label: 'Employees', value: '246' },
    { label: 'Attendance today', value: '92%' },
    { label: 'Open leave requests', value: '11' },
  ];
}
