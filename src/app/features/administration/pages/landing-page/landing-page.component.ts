import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { NavigationService } from '../../../../core/services/navigation.service';
import { ErpModule } from '../../../../core/models/navigation.models';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
  modules$: Observable<ErpModule[]> = this.nav.getModules();

  // ✅ Demo widgets data (পরবর্তীতে API থেকে আনবেন)
  unreadNotices = 3;
  pendingApprovals = 2;
  totalDays = 26;
  presents = 22;
  leaveEnjoyed = 5;
  leaveLeft = 7;

  constructor(private nav: NavigationService, private router: Router) {}

  openModule(m: ErpModule) {
    this.nav.setActiveModule(m);
    this.router.navigateByUrl(m.defaultRoute || '/landing');
  }

  // ✅ Widget actions (এখন placeholder route)
  goToNotices() {
    // future route: /hrm/notices etc.
    this.router.navigateByUrl('/landing');
  }

  goToApprovals() {
    this.router.navigateByUrl('/landing');
  }

  goToAttendanceDetails() {
    this.router.navigateByUrl('/landing');
  }

  applyLeave() {
    this.router.navigateByUrl('/landing');
  }
}
