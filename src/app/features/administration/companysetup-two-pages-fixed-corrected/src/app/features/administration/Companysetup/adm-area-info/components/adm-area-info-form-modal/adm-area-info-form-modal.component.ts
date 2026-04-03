import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  AdmAreaInfo,
  SaveAdmAreaInfoRequest,
  UpdateAdmAreaInfoRequest
} from '../../models/adm-area-info.model';
import { AdmAreaInfoService } from '../../services/adm-area-info.service';

@Component({
  standalone: true,
  selector: 'app-adm-area-info-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-area-info-form-modal.component.html',
  styleUrl: './adm-area-info-form-modal.component.scss'
})
export class AdmAreaInfoFormModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdmAreaInfoService);

  @Input() isOpen = false;
  @Input() model: AdmAreaInfo | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  saving = false;

  readonly form = this.fb.group({
    compId: ['', Validators.required],
    areaName: ['', Validators.required],
    areaNameBng: [''],
    areaAddressEng: [''],
    areaAddressBng: [''],
    shortName: [''],
    shortNameBng: [''],
    sortOrder: [0],
    isActive: [true]
  });

  get isEdit(): boolean {
    return !!this.model?.areaId;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model'] || changes['isOpen']) {
      this.resetForm();
    }
  }

  close(): void {
    this.cancel.emit();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const createPayload: SaveAdmAreaInfoRequest = {
      compId: raw.compId ?? '',
      areaName: raw.areaName ?? '',
      areaNameBng: raw.areaNameBng ?? null,
      areaAddressEng: raw.areaAddressEng ?? null,
      areaAddressBng: raw.areaAddressBng ?? null,
      shortName: raw.shortName ?? null,
      shortNameBng: raw.shortNameBng ?? null,
      sortOrder: raw.sortOrder ?? null,
      isActive: raw.isActive ?? true
    };

    const request$ = this.isEdit
      ? this.service.update({
          areaId: this.model!.areaId,
          ...createPayload
        } as UpdateAdmAreaInfoRequest)
      : this.service.create(createPayload);

    this.saving = true;
    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.saved.emit()
      });
  }

  private resetForm(): void {
    this.form.reset({
      compId: this.model?.compId ?? '',
      areaName: this.model?.areaName ?? '',
      areaNameBng: this.model?.areaNameBng ?? '',
      areaAddressEng: this.model?.areaAddressEng ?? '',
      areaAddressBng: this.model?.areaAddressBng ?? '',
      shortName: this.model?.shortName ?? '',
      shortNameBng: this.model?.shortNameBng ?? '',
      sortOrder: this.model?.sortOrder ?? 0,
      isActive: this.model?.isActive ?? true
    });
  }
}
