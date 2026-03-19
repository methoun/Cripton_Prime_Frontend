import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

export type UiTableCellValue = string | number | Date | null | undefined;
export type UiTableColumnType = 'text' | 'number' | 'date' | 'datetime' | 'chip';

export interface UiTableChipConfig {
  color?: 'primary' | 'accent' | 'warn';
}

export interface UiTableColumn<T = unknown> {
  key: string;
  header: string;
  type?: UiTableColumnType;
  kind?: 'text' | 'email' | 'role' | 'status' | 'actions';
  hidden?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
  headerClass?: string;
  cellClass?: string;
  formatter?: (row: T) => UiTableCellValue;
  value?: (row: T) => UiTableCellValue;
  cell?: (row: T) => UiTableCellValue;
  chipConfig?: (row: T) => UiTableChipConfig;
  statusResolver?: (row: T) => boolean;
}

export interface UiTableAction<T = unknown> {
  key?: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
  variant?: 'icon' | 'stroked' | 'flat';
  tooltip?: string;
  onClick?: (row: T) => void;
  hidden?: (row: T) => boolean;
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './ui-table.component.html',
  styleUrls: ['./ui-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTableComponent<T = unknown> implements OnChanges, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  @Input() data: readonly T[] = [];
  @Input() rows: readonly T[] = [];
  @Input() columns: readonly UiTableColumn<T>[] = [];
  @Input() actions: readonly UiTableAction<T>[] = [];
  @Input() loading = false;

  @Input() title = '';
  @Input() enableSearch = true;
  @Input() searchEnabled = true;
  @Input() searchLabel = 'Search';
  @Input() searchPlaceholder = 'Search...';

  @Input() emptyTitle = 'No data found';
  @Input() emptyDescription = 'There are no records to display.';
  @Input() emptySubtitle = 'There are no records to display.';

  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() showFirstLastButtons = true;

  @Output() actionClick = new EventEmitter<{ action: UiTableAction<T>; row: T }>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  readonly actionsColumnKey = '__actions';
  readonly dataSource = new MatTableDataSource<T>([]);

  searchTerm = '';
  displayedColumns: string[] = [];

  get resolvedRows(): readonly T[] {
    return this.data.length > 0 ? this.data : this.rows;
  }

  get resolvedEnableSearch(): boolean {
    return this.enableSearch || this.searchEnabled;
  }

  get resolvedEmptyDescription(): string {
    return this.emptyDescription || this.emptySubtitle;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['actions']) {
      this.refreshDisplayedColumns();
      this.configureFilter();
    }

    if (changes['data'] || changes['rows']) {
      this.dataSource.data = [...this.resolvedRows];
      this.applyFilter(this.searchTerm);
    }

    if (changes['pageSize'] && this.paginator) {
      this.paginator.pageSize = this.pageSize;
    }
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.pageSize = this.pageSize;
    }

    this.configureFilter();
    this.refreshDisplayedColumns();
    this.dataSource.data = [...this.resolvedRows];
    this.applyFilter(this.searchTerm);
  }

  trackByColumn = (_index: number, column: UiTableColumn<T>): string => this.getColumnName(column);

  trackByAction = (index: number, action: UiTableAction<T>): string => action.key ?? `${action.label}-${index}`;

  getVisibleColumns(): UiTableColumn<T>[] {
    return this.columns.filter((column) => !column.hidden && column.key !== 'actions' && column.kind !== 'actions');
  }

  getColumnName(column: UiTableColumn<T>): string {
    return String(column.key);
  }

  isActionsColumnVisible(): boolean {
    return this.actions.length > 0;
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.searchTerm = value;
    this.applyFilter(value);
    this.searchChange.emit(value.trim());
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter('');
    this.searchChange.emit('');
  }

  onAction(action: UiTableAction<T>, row: T): void {
    if (this.isActionDisabled(action, row)) {
      return;
    }

    action.onClick?.(row);
    this.actionClick.emit({ action, row });
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  isActionHidden(action: UiTableAction<T>, row: T): boolean {
    if (action.hidden) {
      return action.hidden(row);
    }
    if (action.visible) {
      return !action.visible(row);
    }
    return false;
  }

  isActionDisabled(action: UiTableAction<T>, row: T): boolean {
    return action.disabled?.(row) ?? false;
  }

  getCellValue(row: T, column: UiTableColumn<T>): UiTableCellValue {
    if (column.formatter) {
      return column.formatter(row);
    }
    if (column.value) {
      return column.value(row);
    }
    if (column.cell) {
      return column.cell(row);
    }
    return this.readRowValue(row, column.key);
  }

  getDateCellValue(row: T, column: UiTableColumn<T>): string | number | Date | null | undefined {
    const value = this.getCellValue(row, column);
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date || value == null) {
      return value;
    }
    return undefined;
  }

  getChipClass(row: T, column: UiTableColumn<T>): string {
    const config = column.chipConfig?.(row);
    switch (config?.color) {
      case 'warn':
        return 'ui-table__badge ui-table__badge--warn';
      case 'accent':
        return 'ui-table__badge ui-table__badge--accent';
      default:
        return 'ui-table__badge ui-table__badge--primary';
    }
  }

  private refreshDisplayedColumns(): void {
    const visibleColumnNames = this.getVisibleColumns().map((column) => this.getColumnName(column));
    this.displayedColumns = this.isActionsColumnVisible()
      ? [...visibleColumnNames, this.actionsColumnKey]
      : visibleColumnNames;
  }

  private configureFilter(): void {
    this.dataSource.filterPredicate = (row: T, filter: string): boolean => {
      const normalizedFilter = filter.trim().toLowerCase();

      if (!normalizedFilter) {
        return true;
      }

      return this.getVisibleColumns()
        .filter((column) => column.searchable !== false)
        .some((column) => String(this.getCellValue(row, column) ?? '').toLowerCase().includes(normalizedFilter));
    };
  }

  private applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private readRowValue(row: T, key: string): UiTableCellValue {
    if (row && typeof row === 'object') {
      const record = row as { [key: string]: unknown };
      const value = record[key];
      if (value == null || typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
        return value;
      }
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return String(value);
    }
    return undefined;
  }
}
