import { Component, Input } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-card.component.html',
  styleUrls: ['./ui-card.component.scss'],
})
export class UiCardComponent {
  @Input() title: string | null = null;
  @Input() subtitle: string | null = null;
  @Input() padded = true;
}
