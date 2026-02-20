import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

export interface UiDateRangeValue {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'ui-date-range',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-date-range.component.html',
  styleUrls: ['./ui-date-range.component.scss'],
})
export class UiDateRangeComponent {
  @Input({ required: true }) group!: FormGroup<{
    start: FormControl<Date | null>;
    end: FormControl<Date | null>;
  }>;
  @Input() label = 'Date range';
  @Input() disabled = false;
}
