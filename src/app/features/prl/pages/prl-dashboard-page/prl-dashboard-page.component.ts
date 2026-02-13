import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-prl-dashboard-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './prl-dashboard-page.component.html',
  styleUrl: './prl-dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrlDashboardPageComponent {}
