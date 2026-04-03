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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelectionModel } from '@angular/cdk/collections';

import * as XLSX from 'xlsx';

export type UiTableCellValue = string | number | boolean | Date | null | undefined;

export interface UiTableFeatures {
  search?: boolean;
  sort?: boolean;
  pagination?: boolean;
  selection?: boolean;
  export?: boolean;
  exportCsv?: boolean;
  exportExcel?: boolean;
  refresh?: boolean;
  stickyHeader?: boolean;
  emptyState?: boolean;
  loadingOverlay?: boolean;
  rowClick?: boolean;
}

export interface UiTableColumn<T> {
  key: keyof T | string;
  header: string;
  hidden?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  width?: string;
  headerClass?: string;
  cellClass?: string;
  formatter?: (row: T) => UiTableCellValue;
  cell?: (row: T) => UiTableCellValue;
  value?: (row: T) => UiTableCellValue;
}

export interface UiTableAction<T> {
  key?: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
  variant?: 'icon' | 'stroked' | 'flat';
  tooltip?: string;
  hidden?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  onClick?: (row: T) => void;
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSortModule,
    MatMenuModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './ui-table.component.html',
  styleUrls: ['./ui-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTableComponent<T extends object> implements OnChanges, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  @Input() data: readonly T[] = [];
  @Input() rows: readonly T[] = [];
  @Input() columns: readonly UiTableColumn<T>[] = [];
  @Input() actions: readonly UiTableAction<T>[] = [];

  @Input() loading = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() searchEnabled = true;
  @Input() searchLabel = 'Search';
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyTitle = 'No data found';
  @Input() emptyDescription = 'There are no records to display.';
  @Input() emptySubtitle = '';
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() showFirstLastButtons = true;

  // legacy built-in optional features
  @Input() enableExport = true;
  @Input() exportFileName = 'table-data';
  @Input() enableRefresh = true;

  // new unified feature toggle config
  @Input() features: UiTableFeatures = {};

  @Output() actionClick = new EventEmitter<{ action: UiTableAction<T>; row: T }>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() refreshClick = new EventEmitter<void>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();

  readonly actionsColumnKey = '__actions';
  readonly selectionColumnKey = '__selection';
  readonly dataSource = new MatTableDataSource<T>([]);
  readonly selection = new SelectionModel<T>(true, []);

  searchTerm = '';
  displayedColumns: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['actions'] || changes['features']) {
      this.refreshDisplayedColumns();
      this.configureFilter();
      this.configureSorting();
      this.updateTableReferences();
    }

    if (changes['data'] || changes['rows']) {
      this.dataSource.data = [...this.getInputRows()];
      this.selection.clear();
      this.emitSelection();
      this.applyFilter(this.searchTerm);
    }

    if (changes['pageSize'] && this.paginator) {
      this.paginator.pageSize = this.pageSize;
    }
  }

  ngAfterViewInit(): void {
    this.updateTableReferences();
    this.refreshDisplayedColumns();
    this.configureFilter();
    this.configureSorting();
    this.applyFilter(this.searchTerm);
  }

  trackByColumn = (_index: number, column: UiTableColumn<T>): string => this.getColumnName(column);

  trackByAction = (index: number, action: UiTableAction<T>): string =>
    action.key ?? action.label ?? String(index);

  getVisibleColumns(): UiTableColumn<T>[] {
    return this.columns.filter((column) => !column.hidden);
  }

  getColumnName(column: UiTableColumn<T>): string {
    return String(column.key);
  }

  isColumnSortable(column: UiTableColumn<T>): boolean {
    return this.isSortEnabled() && column.sortable === true;
  }

  isSearchEnabled(): boolean {
    return this.features.search ?? this.searchEnabled;
  }

  isPaginationEnabled(): boolean {
    return this.features.pagination ?? true;
  }

  isSortEnabled(): boolean {
    return this.features.sort ?? true;
  }

  isSelectionEnabled(): boolean {
    return this.features.selection ?? false;
  }

  isRefreshEnabled(): boolean {
    return this.features.refresh ?? this.enableRefresh;
  }

  isExportEnabled(): boolean {
    return this.features.export ?? this.enableExport;
  }

  isCsvExportEnabled(): boolean {
    return this.isExportEnabled() && (this.features.exportCsv ?? true);
  }

  isExcelExportEnabled(): boolean {
    return this.isExportEnabled() && (this.features.exportExcel ?? true);
  }

  isStickyHeaderEnabled(): boolean {
    return this.features.stickyHeader ?? true;
  }

  isEmptyStateEnabled(): boolean {
    return this.features.emptyState ?? true;
  }

  isLoadingOverlayEnabled(): boolean {
    return this.features.loadingOverlay ?? true;
  }

  isRowClickEnabled(): boolean {
    return this.features.rowClick ?? false;
  }

  hasToolbar(): boolean {
    return (
      !!this.title ||
      !!this.subtitle ||
      this.isSearchEnabled() ||
      this.isExportEnabled() ||
      this.isRefreshEnabled()
    );
  }

  hasActions(): boolean {
    return this.actions.length > 0;
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const value = input?.value ?? '';
    this.searchTerm = value;
    this.applyFilter(value);
    this.searchChange.emit(value.trim());
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter('');
    this.searchChange.emit('');
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onRefresh(): void {
    this.refreshClick.emit();
  }

  onRowClick(row: T): void {
    if (!this.isRowClickEnabled()) {
      return;
    }

    this.rowClick.emit(row);
  }

  isActionHidden(action: UiTableAction<T>, row: T): boolean {
    return action.hidden?.(row) ?? false;
  }

  isActionDisabled(action: UiTableAction<T>, row: T): boolean {
    return action.disabled?.(row) ?? false;
  }

  onAction(action: UiTableAction<T>, row: T): void {
    if (this.isActionDisabled(action, row)) {
      return;
    }

    action.onClick?.(row);
    this.actionClick.emit({ action, row });
  }

  getCellValue(row: T, column: UiTableColumn<T>): UiTableCellValue {
    if (column.formatter) {
      return column.formatter(row);
    }

    if (column.cell) {
      return column.cell(row);
    }

    if (column.value) {
      return column.value(row);
    }

    const key = column.key as keyof T;
    const rawValue = row[key];

    if (this.isUiTableCellValue(rawValue)) {
      return rawValue;
    }

    return String(rawValue);
  }

  isAllSelected(): boolean {
    const rows = this.getSelectableRows();
    return rows.length > 0 && this.selection.selected.length === rows.length;
  }

  isSomeSelected(): boolean {
    const selectedCount = this.selection.selected.length;
    return selectedCount > 0 && !this.isAllSelected();
  }

  toggleAllRows(checked: boolean): void {
    this.selection.clear();

    if (checked) {
      this.getSelectableRows().forEach((row) => this.selection.select(row));
    }

    this.emitSelection();
  }

  toggleRowSelection(row: T, checked: boolean): void {
    if (checked) {
      this.selection.select(row);
    } else {
      this.selection.deselect(row);
    }

    this.emitSelection();
  }

  exportCsv(): void {
    const exportRows = this.getExportRows();
    const visibleColumns = this.getVisibleColumns();

    const headers = visibleColumns.map((column) => column.header);
    const csvRows: string[] = [];

    csvRows.push(headers.map((value) => this.escapeCsv(value)).join(','));

    exportRows.forEach((row) => {
      const values = visibleColumns.map((column) =>
        this.escapeCsv(this.formatExportValue(this.getCellValue(row, column)))
      );
      csvRows.push(values.join(','));
    });

    const csvContent = '\ufeff' + csvRows.join('\n');
    this.downloadBlob(csvContent, `${this.exportFileName}.csv`, 'text/csv;charset=utf-8;');
  }

  exportExcel(): void {
    const exportRows = this.getExportRows();
    const visibleColumns = this.getVisibleColumns();

    const sheetData = exportRows.map((row) => {
      const record: Record<string, string | number | boolean | Date | null> = {};

      visibleColumns.forEach((column) => {
        record[column.header] = this.normalizeExcelValue(this.getCellValue(row, column));
      });

      return record;
    });

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${this.exportFileName}.xlsx`);
  }

  private configureFilter(): void {
    this.dataSource.filterPredicate = (row: T, filter: string): boolean => {
      const normalizedFilter = filter.trim().toLowerCase();

      if (!normalizedFilter) {
        return true;
      }

      return this.getVisibleColumns()
        .filter((column) => column.searchable !== false)
        .some((column) => {
          const value = this.getCellValue(row, column);
          return String(value ?? '').toLowerCase().includes(normalizedFilter);
        });
    };
  }

  private configureSorting(): void {
    this.dataSource.sortingDataAccessor = (row: T, sortHeaderId: string): string | number => {
      const column = this.getVisibleColumns().find(
        (item) => this.getColumnName(item) === sortHeaderId
      );

      if (!column) {
        return '';
      }

      const value = this.getCellValue(row, column);

      if (value instanceof Date) {
        return value.getTime();
      }

      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }

      return String(value ?? '').toLowerCase();
    };
  }

  private updateTableReferences(): void {
    if (this.isPaginationEnabled() && this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.pageSize = this.pageSize;
    } else {
      this.dataSource.paginator = null;
    }

    if (this.isSortEnabled() && this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      this.dataSource.sort = null;
    }
  }

  private applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private getInputRows(): readonly T[] {
    return this.data.length > 0 ? this.data : this.rows;
  }

  private refreshDisplayedColumns(): void {
    const cols: string[] = [];

    if (this.isSelectionEnabled()) {
      cols.push(this.selectionColumnKey);
    }

    cols.push(...this.getVisibleColumns().map((column) => this.getColumnName(column)));

    if (this.hasActions()) {
      cols.push(this.actionsColumnKey);
    }

    this.displayedColumns = cols;
  }

  private getSelectableRows(): T[] {
    return [...this.dataSource.filteredData];
  }

  private emitSelection(): void {
    this.selectionChange.emit([...this.selection.selected]);
  }

  private getExportRows(): T[] {
    return this.dataSource.filteredData.length > 0 || this.searchTerm
      ? [...this.dataSource.filteredData]
      : [...this.dataSource.data];
  }

  private formatExportValue(value: UiTableCellValue): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  private normalizeExcelValue(
    value: UiTableCellValue
  ): string | number | boolean | Date | null {
    if (value === undefined) {
      return null;
    }

    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Date
    ) {
      return value;
    }

    return String(value);
  }

  private escapeCsv(value: string): string {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  private downloadBlob(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  private isUiTableCellValue(value: unknown): value is UiTableCellValue {
    return (
      value === null ||
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Date
    );
  }
}
