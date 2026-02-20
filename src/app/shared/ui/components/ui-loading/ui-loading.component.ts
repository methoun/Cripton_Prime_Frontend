import { Component, Input } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-loading',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-loading.component.html',
  styleUrls: ['./ui-loading.component.scss'],
})
export class UiLoadingComponent {
  @Input() loading = false;
  @Input() message: string | null = 'Loading...';
}
