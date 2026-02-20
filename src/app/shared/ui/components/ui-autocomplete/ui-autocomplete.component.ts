import { Component, Input, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';

export interface UiAutocompleteItem<T = any> {
  value: T;
  label: string;
}

@Component({
  selector: 'ui-autocomplete',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-autocomplete.component.html',
  styleUrls: ['./ui-autocomplete.component.scss'],
})
export class UiAutocompleteComponent<T = any> {
  @Input({ required: true }) control!: FormControl<T | null>;
  @Input() label = '';
  @Input() placeholder: string | null = null;
  @Input() items: UiAutocompleteItem<T>[] = [];
  @Input() disabled = false;

  private query = signal('');

  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.items;
    return (this.items ?? []).filter(i => i.label.toLowerCase().includes(q));
  });

  onInput(v: string) { this.query.set(v ?? ''); }

  displayWith = (val: any) => {
    const found = (this.items ?? []).find(x => x.value === val);
    return found?.label ?? '';
  };
}
