import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-input.component.html',
  styleUrls: ['./ui-input.component.scss'],
})
export class UiInputComponent implements OnChanges {
  @Input({ required: true }) control!: FormControl<string | null>;
  @Input() label = '';
  @Input() placeholder: string | null = null;
  @Input() hint: string | null = null;
  @Input() required = false;
  @Input() disabled = false;
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' = 'text';
  @Input() prefixIcon: string | null = null;
  @Input() suffixIcon: string | null = null;
  @Input() autocomplete: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.control) return;

    if (changes['disabled']) {
      if (this.disabled && this.control.enabled) {
        this.control.disable({ emitEvent: false });
      } else if (!this.disabled && this.control.disabled) {
        this.control.enable({ emitEvent: false });
      }
    }
  }

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