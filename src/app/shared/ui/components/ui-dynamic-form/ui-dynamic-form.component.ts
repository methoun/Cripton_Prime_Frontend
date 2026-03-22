import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { UiInputComponent } from '../ui-input/ui-input.component';
import { UiSelectComponent } from '../ui-select/ui-select.component';
import { UiTextareaComponent } from '../ui-textarea/ui-textarea.component';
import { UiToggleComponent } from '../ui-toggle/ui-toggle.component';

export interface UiFormOption {
  label: string;
  value: string | number | boolean | null;
}

export interface UiFormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'toggle';
  placeholder?: string;
  options?: UiFormOption[];
  colSpan?: 12 | 6 | 4 | 3;
  hint?: string;
  required?: boolean;
  rows?: number;
}

@Component({
  selector: 'ui-dynamic-form',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    UiInputComponent,
    UiSelectComponent,
    UiTextareaComponent,
    UiToggleComponent,
  ],
  templateUrl: './ui-dynamic-form.component.html',
  styleUrls: ['./ui-dynamic-form.component.scss'],
})
export class UiDynamicFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() fields: UiFormField[] = [];

  getColSpanClass(colSpan?: UiFormField['colSpan']): string {
    return `ui-dynamic-form__col--${colSpan ?? 12}`;
  }
}