import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-checkbox.component.html',
  styleUrls: ['./ui-checkbox.component.scss'],
})
export class UiCheckboxComponent {
  @Input({ required: true }) control!: FormControl<boolean | null>;
  @Input() label = '';
  @Input() disabled = false;
}
