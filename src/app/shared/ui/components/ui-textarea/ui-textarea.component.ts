import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-textarea.component.html',
  styleUrls: ['./ui-textarea.component.scss'],
})
export class UiTextareaComponent {
  @Input({ required: true }) control!: FormControl<string | null>;
  @Input() label = '';
  @Input() placeholder: string | null = null;
  @Input() hint: string | null = null;
  @Input() required = false;
  @Input() disabled = false;
  @Input() rows = 3;
}
