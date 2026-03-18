import {
  AfterViewInit,
  Component,
  ContentChild,
  Input,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiEmptyComponent } from '../ui-empty/ui-empty.component';

export interface UiTableAction<T = any> {
  label: string;
  icon: string;
  color?: 'primary' | 'warn';
  onClick: (row: T) => void;
  visible?: (row: T) => boolean;
}

export interface UiTableColumn<T = any> {
  key: string;
  header: string;
  kind?: 'text' | 'email' | 'role' | 'status' | 'actions';
  width?: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  value?: (row: T) => any;
  statusResolver?: (row: T) => boolean;
  actions?: UiTableAction<T>[];
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    UiEmptyComponent
  ],
  templateUrl: './ui-table.component.html',
  styleUrls: ['./ui-table.component.scss']
})
export class UiTableComponent<T = any> implements AfterViewInit {
  @Input() columns: UiTableColumn<T>[] = [];
  @Input() rows: T[] = [];
  @Input() loading = false;
  @Input() searchEnabled = true;
  @Input() searchPlaceholder = 'Search';
  @Input() emptyTitle = 'No data found';
  @Input() emptySubtitle = 'There is nothing to show right now.';
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50];

  @ContentChild('tableActions', { static: false }) tableActionsTpl?: TemplateRef<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<T>([]);

  get displayedColumns(): string[] {
    return this.columns.map(col => col.key);
  }

  get hasProjectedActions(): boolean {
    return !!this.tableActionsTpl;
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<T>(this.rows || []);
    this.dataSource.filterPredicate = (row: T, filter: string) => {
      const keyword = filter.trim().toLowerCase();
      return this.columns.some(col => {
        if (col.kind === 'actions') return false;
        const value = this.getCellText(col, row).toLowerCase();
        return value.includes(keyword);
      });
    };
  }

  ngOnChanges(): void {
    this.dataSource.data = this.rows || [];
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(value: string): void {
    this.dataSource.filter = (value || '').trim().toLowerCase();
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  getCellValue(col: UiTableColumn<T>, row: T): any {
    if (col.value) return col.value(row);
    return (row as any)?.[col.key];
  }

  getCellText(col: UiTableColumn<T>, row: T): string {
    const value = this.getCellValue(col, row);
    if (value === null || value === undefined) return '';
    return String(value);
  }

  getCellTitle(col: UiTableColumn<T>, row: T): string {
    return this.getCellText(col, row);
  }

  isRowStatusActive(col: UiTableColumn<T>, row: T): boolean {
    if (col.statusResolver) return !!col.statusResolver(row);

    const value = this.getCellValue(col, row);

    if (typeof value === 'boolean') return value;

    const text = String(value || '').toLowerCase();
    return text === 'active' || text === 'true' || text === '1';
  }

  canShowAction(action: UiTableAction<T>, row: T): boolean {
    return action.visible ? action.visible(row) : true;
  }
  
}
