import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { SelectionModel } from '@angular/cdk/collections';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  horizontalScroll?: boolean;
}

export interface UiTableColumn<T> {
  key: keyof T | string;
  header: string;
  hidden?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  headerClass?: string;
  cellClass?: string;
  badge?: boolean;
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
  changeDetection: ChangeDetectionStrategy.Default,
})
export class UiTableComponent<T extends object> implements OnChanges, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  @Input() data: readonly T[] = [];
  @Input() rows: readonly T[] = [];
  @Input() columns: readonly UiTableColumn<T>[] = [];
  @Input() actions: readonly UiTableAction<T>[] = [];
  @Input() features: UiTableFeatures = {};

  private _loading = false;

  @Input()
  set loading(value: boolean) {
    this._loading = value;
    this.cdr.markForCheck();
  }
  get loading(): boolean {
    return this._loading;
  }

  @Input() title = '';
  @Input() subtitle = '';
  @Input() searchLabel = 'Search';
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyTitle = 'No data found';
  @Input() emptyDescription = 'There are no records to display.';
  @Input() emptySubtitle = '';
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() showFirstLastButtons = true;
  @Input() exportFileName = 'table-data';

  @Output() actionClick = new EventEmitter<{ action: UiTableAction<T>; row: T }>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() refreshClick = new EventEmitter<void>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();

  readonly selectionColumnKey = '__select';
  readonly actionsColumnKey = '__actions';
  readonly dataSource = new MatTableDataSource<T>([]);
  readonly selection = new SelectionModel<T>(true, []);

  searchTerm = '';
  displayedColumns: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['actions'] || changes['features']) {
      this.refreshDisplayedColumns();
      this.configureFilter();
      this.configureSorting();
    }

    if (changes['data'] || changes['rows']) {
      this.updateDataSource();
    }

    if (changes['pageSize'] && this.paginator) {
      this.paginator.pageSize = this.pageSize;
    }

    this.cdr.markForCheck();
  }

  private updateDataSource(): void {
    const newRows = [...this.getInputRows()];
    
    // ✅ NgZone এর ভেতরে ডাটা আপডেট করা হচ্ছে যাতে ক্লিক ছাড়াই রেন্ডার হয়
    this.zone.run(() => {
      this.dataSource.data = newRows;
      this.selection.clear();
      this.selectionChange.emit(this.selection.selected);
      this.applyFilter(this.searchTerm);
      this.refreshDisplayedColumns();
      
      // ✅ চেঞ্জ ডিটেকশন ট্রিগার করা
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.pageSize = this.pageSize;
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;
    }

    this.refreshDisplayedColumns();
    this.configureFilter();
    this.configureSorting();
    this.applyFilter(this.searchTerm);

    this.cdr.detectChanges();
  }

  // --- Helper Methods ---

  trackByColumn = (_index: number, column: UiTableColumn<T>): string =>
    this.getColumnName(column);

  trackByAction = (index: number, action: UiTableAction<T>): string =>
    action.key ?? action.label ?? String(index);

  hasToolbar(): boolean {
    return (
      !!this.title ||
      !!this.subtitle ||
      this.isSearchEnabled() ||
      this.isRefreshEnabled() ||
      this.isExportEnabled() ||
      (this.isSelectionEnabled() && this.selection.selected.length > 0)
    );
  }

  hasActions(): boolean {
    return this.actions.length > 0;
  }

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
    return this.features.search ?? true;
  }

  isSortEnabled(): boolean {
    return this.features.sort ?? true;
  }

  isPaginationEnabled(): boolean {
    return this.features.pagination ?? true;
  }

  isSelectionEnabled(): boolean {
    return this.features.selection ?? false;
  }

  isExportEnabled(): boolean {
    return this.features.export ?? true;
  }

  isCsvExportEnabled(): boolean {
    return (this.features.exportCsv ?? true) && this.isExportEnabled();
  }

  isExcelExportEnabled(): boolean {
    return (this.features.exportExcel ?? true) && this.isExportEnabled();
  }

  isRefreshEnabled(): boolean {
    return this.features.refresh ?? true;
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

  isHorizontalScrollEnabled(): boolean {
    return this.features.horizontalScroll ?? true;
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

  isBadgeColumn(column: UiTableColumn<T>): boolean {
    return column.badge === true;
  }

  getBadgeLabel(value: UiTableCellValue): string {
    if (value === true || value === 1) return 'Active';
    if (value === false || value === 0) return 'Inactive';

    const normalized = String(value ?? '').trim().toLowerCase();

    if (['yes', 'active', 'true', '1'].includes(normalized)) return 'Active';
    if (['no', 'inactive', 'false', '0'].includes(normalized)) return 'Inactive';

    return 'Unknown';
  }

  getBadgeClass(value: UiTableCellValue): string {
    const label = this.getBadgeLabel(value);
    if (label === 'Active') return 'ui-table__badge ui-table__badge--success';
    if (label === 'Inactive') return 'ui-table__badge ui-table__badge--danger';
    return 'ui-table__badge ui-table__badge--neutral';
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return numRows > 0 && numSelected === numRows;
  }

  isSomeSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return numSelected > 0 && numSelected < numRows;
  }

  toggleAllRows(checked: boolean): void {
    if (checked) {
      this.selection.clear();
      this.dataSource.filteredData.forEach((row) => this.selection.select(row));
    } else {
      this.selection.clear();
    }
    this.selectionChange.emit(this.selection.selected);
  }

  toggleRowSelection(row: T, checked: boolean): void {
    if (checked) {
      this.selection.select(row);
    } else {
      this.selection.deselect(row);
    }
    this.selectionChange.emit(this.selection.selected);
  }

  getCellValue(row: T, column: UiTableColumn<T>): UiTableCellValue {
    if (column.formatter) return column.formatter(row);
    if (column.cell) return column.cell(row);
    if (column.value) return column.value(row);

    const key = column.key as keyof T;
    const rawValue = row[key];

    return this.isUiTableCellValue(rawValue) ? rawValue : String(rawValue);
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

  async exportExcel(): Promise<void> {
    const XLSX = await import('xlsx');

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
      if (!normalizedFilter) return true;

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
      if (!column) return '';

      const value = this.getCellValue(row, column);
      if (value instanceof Date) return value.getTime();
      if (typeof value === 'number') return value;
      if (typeof value === 'boolean') return value ? 1 : 0;

      return String(value ?? '').toLowerCase();
    };
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
    if (this.isSelectionEnabled()) cols.push(this.selectionColumnKey);
    cols.push(...this.getVisibleColumns().map((column) => this.getColumnName(column)));
    if (this.hasActions()) cols.push(this.actionsColumnKey);
    this.displayedColumns = cols;
  }

  private getExportRows(): T[] {
    return this.dataSource.filteredData.length > 0 || this.searchTerm
      ? [...this.dataSource.filteredData]
      : [...this.dataSource.data];
  }

  private formatExportValue(value: UiTableCellValue): string {
    if (value instanceof Date) return value.toISOString();
    return value === null || value === undefined ? '' : String(value);
  }

  private normalizeExcelValue(
    value: UiTableCellValue
  ): string | number | boolean | Date | null {
    if (value === undefined) return null;
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