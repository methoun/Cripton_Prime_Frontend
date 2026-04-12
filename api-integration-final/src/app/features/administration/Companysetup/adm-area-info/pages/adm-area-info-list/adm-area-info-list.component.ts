import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import {
  UiTableAction,
  UiTableColumn,
  UiTableComponent,
  UiTableFeatures,
} from '../../../../../../shared/ui/components/ui-table/ui-table.component';

import { AdmAreaInfoFormModalComponent } from '../../components/adm-area-info-form-modal/adm-area-info-form-modal.component';
import { AdmAreaInfo } from '../../models/adm-area-info.model';
import { AdmAreaInfoService } from '../../services/adm-area-info.service';

@Component({
  standalone: true,
  selector: 'app-adm-area-info-list',
  imports: [CommonModule, UiTableComponent, AdmAreaInfoFormModalComponent],
  templateUrl: './adm-area-info-list.component.html',
  styleUrl: './adm-area-info-list.component.scss',
})
export class AdmAreaInfoListComponent implements OnInit {
  private readonly service = inject(AdmAreaInfoService);

  rows: AdmAreaInfo[] = [];
  loading = false;
  isModalOpen = false;
  selectedRow: AdmAreaInfo | null = null;

  readonly tableFeatures: UiTableFeatures = {
    search: true,
    sort: true,
    pagination: true,
    selection: true,
    export: true,
    exportCsv: true,
    exportExcel: true,
    refresh: true,
    stickyHeader: true,
    emptyState: true,
    loadingOverlay: true,
    rowClick: false,
  };

  readonly columns: UiTableColumn<AdmAreaInfo>[] = [
    {
      key: 'areaName',
      header: 'Area Name',
      sortable: true,
      searchable: true,
    },
    {
      key: 'shortName',
      header: 'Short Name',
      sortable: true,
      searchable: true,
      value: (row) => row.shortName ?? '',
    },
    {
      key: 'compId',
      header: 'Company Id',
      sortable: true,
      searchable: true,
    },
    {
      key: 'isActive',
      header: 'Active',
      sortable: true,
      searchable: true,
      value: (row) => (row.isActive ? 'Yes' : 'No'),
    },
    {
      key: 'sortOrder',
      header: 'Sort Order',
      sortable: true,
      searchable: false,
      value: (row) => row.sortOrder ?? 0,
    },
  ];

  readonly actions: UiTableAction<AdmAreaInfo>[] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: 'edit',
      variant: 'icon',
      tooltip: 'Edit area',
      onClick: (row) => this.edit(row),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'delete',
      color: 'warn',
      variant: 'icon',
      tooltip: 'Delete area',
      onClick: (row) => this.remove(row),
    },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (rows) => {
        this.rows = rows ?? [];
        this.loading = false;
      },
      error: () => {
        this.rows = [];
        this.loading = false;
      },
    });
  }

  addNew(): void {
    this.selectedRow = null;
    this.isModalOpen = true;
  }

  edit(row: AdmAreaInfo): void {
    this.selectedRow = { ...row };
    this.isModalOpen = true;
  }

  remove(row: AdmAreaInfo): void {
    if (!row.areaId) return;
    if (!confirm(`Delete ${row.areaName}?`)) return;

    this.service.delete(row.areaId).subscribe({
      next: () => this.load(),
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedRow = null;
  }

  onSaved(): void {
    this.closeModal();
    this.load();
  }

  onSelectionChange(rows: AdmAreaInfo[]): void {
    console.log('Selected area rows:', rows);
  }
}
