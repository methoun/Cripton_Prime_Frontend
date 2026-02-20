import { Component, Input } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';

export interface UiBreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'ui-breadcrumb',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-breadcrumb.component.html',
  styleUrls: ['./ui-breadcrumb.component.scss'],
})
export class UiBreadcrumbComponent {
  @Input() items: UiBreadcrumbItem[] = [];
}
