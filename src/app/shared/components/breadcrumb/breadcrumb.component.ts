import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AsyncPipe } from '@angular/common';

import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { BreadcrumbItem } from '../../../core/models/breadcrumb.model';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, AsyncPipe, MatIconModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  // ✅ your HTML needs "items"
  items: BreadcrumbItem[] = [];

  constructor(private breadcrumb: BreadcrumbService) {
    this.breadcrumb.breadcrumbs$.subscribe(list => (this.items = list || []));
  }
}
