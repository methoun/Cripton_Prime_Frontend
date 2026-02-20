import { Component, Input, ViewChild, ElementRef, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UI_IMPORTS } from '../../ui-imports';
import { UiOption } from '../ui-select/ui-select.component';

@Component({
  selector: 'ui-select-search',
  standalone: true,
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  templateUrl: './ui-select-search.component.html',
  styleUrls: ['./ui-select-search.component.scss'],
})
export class UiSelectSearchComponent<T = any> {
  @Input({ required: true }) control!: FormControl<T | null>;
  @Input() label = '';
  @Input() placeholder: string | null = null;
  @Input() options: UiOption<T>[] = [];
  @Input() hint: string | null = null;
  @Input() required = false;
  @Input() disabled = false;

  @Input() searchPlaceholder = 'Search...';

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  private q = signal('');
  filtered = computed(() => {
    const query = this.q().toLowerCase().trim();
    if (!query) return this.options;
    return (this.options ?? []).filter(o => o.label.toLowerCase().includes(query));
  });

  panelClass = 'ui-select-panel ui-select-search-panel';

  onOpened(opened: boolean) {
    if (opened) {
      this.q.set('');
      queueMicrotask(() => this.searchInput?.nativeElement?.focus());
    }
  }
  onQuery(value: string) { this.q.set(value ?? ''); }
  trackByLabel = (_: number, o: UiOption<T>) => o.label;
}
