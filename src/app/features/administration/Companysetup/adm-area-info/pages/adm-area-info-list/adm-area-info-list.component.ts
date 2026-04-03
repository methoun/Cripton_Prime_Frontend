import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AdmAreaInfo } from '../../models/adm-area-info.model';
import { AdmAreaInfoService } from '../../services/adm-area-info.service';
import { AdmAreaInfoFormModalComponent } from '../../components/adm-area-info-form-modal/adm-area-info-form-modal.component';

@Component({
  standalone: true,
  selector: 'app-adm-area-info-list',
  imports: [CommonModule, AdmAreaInfoFormModalComponent],
  templateUrl: './adm-area-info-list.component.html',
  styleUrl: './adm-area-info-list.component.scss'
})
export class AdmAreaInfoListComponent implements OnInit {
  private readonly service = inject(AdmAreaInfoService);

  rows: AdmAreaInfo[] = [];
  loading = false;
  isModalOpen = false;
  selectedRow: AdmAreaInfo | null = null;

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

  edit(row: AdmAreaInfo): void {
    this.selectedRow = { ...row };
    this.isModalOpen = true;
  }

  remove(row: AdmAreaInfo): void {
    if (!row.areaId) return;
    if (!confirm(`Delete ${row.areaName}?`)) return;

    this.service.delete(row.areaId).subscribe({
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
