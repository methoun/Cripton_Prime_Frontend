import { Component, Input } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';

export type UiButtonVariant = 'flat' | 'stroked' | 'raised' | 'icon';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-button.component.html',
  styleUrls: ['./ui-button.component.scss'],
})
export class UiButtonComponent {
  @Input() label: string | null = null;
  @Input() icon: string | null = null;
  @Input() loading = false;
  @Input() disabled = false;
  @Input() color: 'primary' | 'accent' | 'warn' | undefined = 'primary';
  @Input() variant: UiButtonVariant = 'flat';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() tooltip: string | null = null;
  @Input() fullWidth = false;

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }
}
