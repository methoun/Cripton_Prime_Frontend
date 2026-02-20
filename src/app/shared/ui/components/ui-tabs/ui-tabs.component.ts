import { Component, Input } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';

export interface UiTab {
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-tabs.component.html',
  styleUrls: ['./ui-tabs.component.scss'],
})
export class UiTabsComponent {
  @Input() tabs: UiTab[] = [];
  @Input() selectedIndex = 0;
}
