import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-chip-input',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-chip-input.component.html',
  styleUrls: ['./ui-chip-input.component.scss'],
})
export class UiChipInputComponent {
  @Input() label = 'Tags';
  @Input() placeholder = 'Type and press Enter';
  @Input() values: string[] = [];
  @Output() valuesChange = new EventEmitter<string[]>();

  add(value: string) {
    const v = (value ?? '').trim();
    if (!v) return;
    if (this.values.includes(v)) return;
    this.values = [...this.values, v];
    this.valuesChange.emit(this.values);
  }

  remove(value: string) {
    this.values = (this.values ?? []).filter(x => x !== value);
    this.valuesChange.emit(this.values);
  }
}
