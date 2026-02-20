import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-date',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-date.component.html',
  styleUrls: ['./ui-date.component.scss'],
})
export class UiDateComponent {
  @Input({ required: true }) control!: FormControl<Date | null>;
  @Input() label = 'Date';
  @Input() placeholder: string | null = null;
  @Input() disabled = false;
  @Input() min: Date | null = null;
  @Input() max: Date | null = null;
}
