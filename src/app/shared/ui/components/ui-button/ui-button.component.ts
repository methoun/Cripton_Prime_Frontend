import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

export type UiButtonVariant = 'flat' | 'stroked' | 'raised' | 'icon';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
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
