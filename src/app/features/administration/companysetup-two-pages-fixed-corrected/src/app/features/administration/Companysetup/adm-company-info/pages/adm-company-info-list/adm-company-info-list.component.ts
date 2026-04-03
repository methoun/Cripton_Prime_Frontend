import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import {
  UiTableAction,
  UiTableColumn,
  UiTableComponent,
  UiTableFeatures,
} from '../../../../../../shared/ui/components/ui-table/ui-table.component';

import { AdmCompanyInfoFormModalComponent } from '../../components/adm-company-info-form-modal/adm-company-info-form-modal.component';
import { AdmCompanyInfo } from '../../models/adm-company-info.model';
import { AdmCompanyInfoService } from '../../services/adm-company-info.service';

@Component({
  standalone: true,
  selector: 'app-adm-company-info-list',
  imports: [CommonModule, UiTableComponent, AdmCompanyInfoFormModalComponent],
  templateUrl: './adm-company-info-list.component.html',
  styleUrl: './adm-company-info-list.component.scss',
})
export class AdmCompanyInfoListComponent implements OnInit {
  private readonly service = inject(AdmCompanyInfoService);

  rows: AdmCompanyInfo[] = [];
  loading = false;
  isModalOpen = false;
  selectedRow: AdmCompanyInfo | null = null;

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

  readonly columns: UiTableColumn<AdmCompanyInfo>[] = [
    {
      key: 'compName',
      header: 'Company Name',
      sortable: true,
      searchable: true,
    },
    {
      key: 'phoneNo',
      header: 'Phone',
      sortable: true,
      searchable: true,
      value: (row) => row.phoneNo ?? '',
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      searchable: true,
      value: (row) => row.email ?? '',
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

  readonly actions: UiTableAction<AdmCompanyInfo>[] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: 'edit',
      variant: 'icon',
      tooltip: 'Edit company',
      onClick: (row) => this.edit(row),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'delete',
      color: 'warn',
      variant: 'icon',
      tooltip: 'Delete company',
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

  edit(row: AdmCompanyInfo): void {
    this.selectedRow = { ...row };
    this.isModalOpen = true;
  }

  remove(row: AdmCompanyInfo): void {
    if (!row.compId) return;
    if (!confirm(`Delete ${row.compName}?`)) return;

    this.service.delete(row.compId).subscribe({
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

  onSelectionChange(rows: AdmCompanyInfo[]): void {
    console.log('Selected company rows:', rows);
  }
}
