import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

export interface UiRadioOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-radio-group',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-radio-group.component.html',
  styleUrls: ['./ui-radio-group.component.scss'],
})
export class UiRadioGroupComponent<T = any> {
  @Input({ required: true }) control!: FormControl<T | null>;
  @Input() label: string | null = null;
  @Input() options: UiRadioOption<T>[] = [];
  @Input() disabled = false;
  @Input() layout: 'row' | 'column' = 'row';
}
