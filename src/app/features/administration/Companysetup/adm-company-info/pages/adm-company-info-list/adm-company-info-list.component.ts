import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AdmCompanyInfo } from '../../models/adm-company-info.model';
import { AdmCompanyInfoService } from '../../services/adm-company-info.service';
import { AdmCompanyInfoFormModalComponent } from '../../components/adm-company-info-form-modal/adm-company-info-form-modal.component';

@Component({
  standalone: true,
  selector: 'app-adm-company-info-list',
  imports: [CommonModule, AdmCompanyInfoFormModalComponent],
  templateUrl: './adm-company-info-list.component.html',
  styleUrl: './adm-company-info-list.component.scss'
})
export class AdmCompanyInfoListComponent implements OnInit {
  private readonly service = inject(AdmCompanyInfoService);

  rows: AdmCompanyInfo[] = [];
  loading = false;
  isModalOpen = false;
  selectedRow: AdmCompanyInfo | null = null;

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
      }
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
      next: () => this.load()
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
}
