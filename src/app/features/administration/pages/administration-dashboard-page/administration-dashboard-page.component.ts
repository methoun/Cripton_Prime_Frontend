import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-administration-dashboard-page',
  standalone: true,
  imports: [NgIf, AsyncPipe, MatCardModule, MatIconModule],
  templateUrl: './administration-dashboard-page.component.html',
  styleUrl: './administration-dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministrationDashboardPageComponent {
  private readonly navigation = inject(NavigationService);
  public readonly activeModule$ = this.navigation.activeModule$;
}
