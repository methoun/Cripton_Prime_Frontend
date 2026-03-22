import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

export interface UiOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-select.component.html',
  styleUrls: ['./ui-select.component.scss'],
})
export class UiSelectComponent<T = any> {
  @Input({ required: true }) control!: FormControl<T | null>;
  @Input() label = '';
  @Input() placeholder: string | null = null;
  @Input() options: UiOption<T>[] = [];
  @Input() hint: string | null = null;
  @Input() required = false;
  @Input() disabled = false;

  panelClass = 'ui-select-panel';
    getErrorMessage(): string {
    if (!this.control?.errors) return '';

    if (this.control.errors['required']) {
      return `${this.label} is required`;
    }

    if (this.control.errors['email']) {
      return 'Enter a valid email';
    }

    if (this.control.errors['minlength']) {
      return `${this.label} is too short`;
    }

    if (this.control.errors['maxlength']) {
      return `${this.label} is too long`;
    }

    if (this.control.errors['pattern']) {
      return `Invalid ${this.label}`;
    }

    return `Invalid ${this.label}`;
  }
}
