import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hrm-dashboard-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './hrm-dashboard-page.component.html',
  styleUrl: './hrm-dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HrmDashboardPageComponent {}
