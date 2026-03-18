import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

export interface UiFormOption {
  label: string;
  value: string | number | boolean | null;
}

export interface UiFormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'toggle';
  placeholder?: string;
  hint?: string;
  options?: UiFormOption[];
}

@Component({
  selector: 'ui-dynamic-form',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-dynamic-form.component.html',
  styleUrls: ['./ui-dynamic-form.component.scss'],
})
export class UiDynamicFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() fields: UiFormField[] = [];
}
