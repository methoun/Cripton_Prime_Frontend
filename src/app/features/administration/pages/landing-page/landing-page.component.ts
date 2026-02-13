import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Observable } from 'rxjs';

import { NavigationService } from '../../../../core/services/navigation.service';
import { ErpModule } from '../../../../core/models/navigation.models';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  private readonly nav = inject(NavigationService);
  private readonly router = inject(Router);

  // ✅ template uses this
  public readonly modules$: Observable<ErpModule[]> = this.nav.getModules();

  // ✅ template uses this
  public openModule(m: ErpModule): void {
    this.nav.setActiveModule(m);

    const url = m.defaultRoute ?? '/landing';
    this.router.navigateByUrl(url);
  }
}
