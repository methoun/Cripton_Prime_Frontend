import { Component, Input } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-toolbar',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-toolbar.component.html',
  styleUrls: ['./ui-toolbar.component.scss'],
})
export class UiToolbarComponent {
  @Input() title: string | null = null;
  @Input() subtitle: string | null = null;
}
