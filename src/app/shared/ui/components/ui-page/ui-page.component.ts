import { Component, Input } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-page',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-page.component.html',
  styleUrls: ['./ui-page.component.scss'],
})
export class UiPageComponent {
  @Input() title = '';
  @Input() subtitle: string | null = null;
  @Input() meta: string[] = [];
}
