import { Component, Input } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-empty',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-empty.component.html',
  styleUrls: ['./ui-empty.component.scss'],
})
export class UiEmptyComponent {
  @Input() title = 'No data found';
  @Input() subtitle: string | null = 'Try changing filters or search.';
  @Input() icon = 'inbox';
}
