import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
  imports: [CommonModule, UiTableComponent, MatDialogModule],
  templateUrl: './adm-company-info-list.component.html',
  styleUrl: './adm-company-info-list.component.scss',
})
export class AdmCompanyInfoListComponent implements OnInit {
  private readonly service = inject(AdmCompanyInfoService);
  private readonly dialog = inject(MatDialog);

  rows: AdmCompanyInfo[] = [];
  loading = true;
  pageReady = false;
  selectedRow: AdmCompanyInfo | null = null;

  readonly tableFeatures: UiTableFeatures = {
    search: true,
    sort: true,
    pagination: true,
    selection: false,
    export: true,
    exportCsv: true,
    exportExcel: true,
    refresh: true,
    stickyHeader: true,
    emptyState: true,
    loadingOverlay: true,
    rowClick: false,
    horizontalScroll: true,
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
      badge: true,
      minWidth: '120px',
      value: (row) => (row.isActive ? 'Active' : 'Inactive'),
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
      key: 'view',
      label: 'View',
      icon: 'visibility',
      variant: 'icon',
      tooltip: 'View company',
      onClick: (row) => this.view(row),
    },
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
    this.pageReady = true;
    this.load();
  }

  load(): void {
    this.loading = true;

    this.service.getAll().subscribe({
      next: (rows) => {
        this.rows = rows ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Load failed', err);
        this.rows = [];
        this.loading = false;
      },
    });
  }

  addNew(): void {
    this.openModal(null, 'create', false);
  }

  edit(row: AdmCompanyInfo): void {
    this.openModal({ ...row }, 'edit', false);
  }

  remove(row: AdmCompanyInfo): void {
    if (!row.compId) return;
    if (!confirm(`Delete ${row.compName}?`)) return;

    this.loading = true;

    this.service.delete(row.compId).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error('Delete failed', err);
        this.loading = false;
      },
    });
  }

  onSelectionChange(rows: AdmCompanyInfo[]): void {
    console.log('Selected company rows:', rows);
  }

  view(row: AdmCompanyInfo): void {
    if (!row.compId) {
      this.openModal({ ...row }, 'view', false);
      return;
    }

    this.loading = true;

    this.service.getById(row.compId).subscribe({
      next: (response) => {
        this.loading = false;
        this.openModal(response ?? { ...row }, 'view', false);
      },
      error: (error) => {
        console.error('Failed to load company details', error);
        this.loading = false;
        this.openModal({ ...row }, 'view', false);
      },
    });
  }

  private openModal(
    model: AdmCompanyInfo | null,
    mode: 'create' | 'edit' | 'view',
    closeOnBackdropClick = false
  ): void {
    const dialogRef = this.dialog.open(AdmCompanyInfoFormModalComponent, {
      width: 'min(1040px, 96vw)',
      maxWidth: '96vw',
      maxHeight: '95vh',
      autoFocus: false,
      restoreFocus: false,
      disableClose: !closeOnBackdropClick,
      panelClass: 'company-info-dialog-panel',
      backdropClass: 'company-info-dialog-backdrop',
      data: {
        model,
        mode,
        closeOnBackdropClick,
        closeOnEsc: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.load();
      }
    });
  }
}