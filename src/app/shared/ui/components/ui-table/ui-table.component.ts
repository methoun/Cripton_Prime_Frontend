import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface UiColumnDef<T> {
  key: string;
  header: string;
  cell: (row: T) => string | number | null | undefined;
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-table.component.html',
  styleUrls: ['./ui-table.component.scss'],
})
export class UiTableComponent<T = any> implements AfterViewInit {
  @Input() columns: UiColumnDef<T>[] = [];
  @Input() rows: T[] = [];
  @Input() loading = false;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() emptyTitle = 'No data found';
  @Input() emptySubtitle: string | null = 'Try changing filters or search.';

  dataSource = new MatTableDataSource<T>([]);

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  ngOnChanges(): void {
    this.dataSource.data = this.rows ?? [];
  }

  ngAfterViewInit(): void {
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  applyFilter(value: string) {
    this.dataSource.filter = (value ?? '').trim().toLowerCase();
  }
}
