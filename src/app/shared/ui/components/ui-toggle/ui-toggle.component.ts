import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-toggle',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-toggle.component.html',
  styleUrls: ['./ui-toggle.component.scss'],
})
export class UiToggleComponent {
  @Input({ required: true }) control!: FormControl<boolean | null>;
  @Input() label = '';
  @Input() disabled = false;
}
