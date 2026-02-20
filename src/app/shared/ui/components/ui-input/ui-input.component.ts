import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-input.component.html',
  styleUrls: ['./ui-input.component.scss'],
})
export class UiInputComponent {
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
}
