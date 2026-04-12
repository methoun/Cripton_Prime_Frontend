import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  AdmCompanyInfo,
  SaveAdmCompanyInfoRequest,
  UpdateAdmCompanyInfoRequest
} from '../../models/adm-company-info.model';
import { AdmCompanyInfoService } from '../../services/adm-company-info.service';

@Component({
  standalone: true,
  selector: 'app-adm-company-info-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-company-info-form-modal.component.html',
  styleUrl: './adm-company-info-form-modal.component.scss'
})
export class AdmCompanyInfoFormModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdmCompanyInfoService);

  @Input() isOpen = false;
  @Input() model: AdmCompanyInfo | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  saving = false;

  readonly form = this.fb.group({
    compName: ['', Validators.required],
    compNameBng: [''],
    shortNameEng: [''],
    shortNameBng: [''],
    addressEng: [''],
    addressBng: [''],
    phoneNo: [''],
    email: [''],
    mailPort: [null as number | null],
    mailPass: [''],
    mailFrom: [''],
    setupCompWise: [false],
    sortOrder: [null as number | null],
    isActive: [true]
  });

  get isEdit(): boolean {
    return !!this.model?.compId;
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
    const createPayload: SaveAdmCompanyInfoRequest = {
      compName: raw.compName ?? '',
      compNameBng: raw.compNameBng ?? null,
      shortNameEng: raw.shortNameEng ?? null,
      shortNameBng: raw.shortNameBng ?? null,
      addressEng: raw.addressEng ?? null,
      addressBng: raw.addressBng ?? null,
      phoneNo: raw.phoneNo ?? null,
      email: raw.email ?? null,
      mailPort: raw.mailPort ?? null,
      mailPass: raw.mailPass ?? null,
      mailFrom: raw.mailFrom ?? null,
      setupCompWise: raw.setupCompWise ?? false,
      sortOrder: raw.sortOrder ?? null,
      isActive: raw.isActive ?? true
    };

    const request$ = this.isEdit
      ? this.service.update({
          compId: this.model!.compId,
          ...createPayload
        } as UpdateAdmCompanyInfoRequest)
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
      compName: this.model?.compName ?? '',
      compNameBng: this.model?.compNameBng ?? '',
      shortNameEng: this.model?.shortNameEng ?? '',
      shortNameBng: this.model?.shortNameBng ?? '',
      addressEng: this.model?.addressEng ?? '',
      addressBng: this.model?.addressBng ?? '',
      phoneNo: this.model?.phoneNo ?? '',
      email: this.model?.email ?? '',
      mailPort: this.model?.mailPort ?? null,
      mailPass: this.model?.mailPass ?? '',
      mailFrom: this.model?.mailFrom ?? '',
      setupCompWise: this.model?.setupCompWise ?? false,
      sortOrder: this.model?.sortOrder ?? null,
      isActive: this.model?.isActive ?? true
    });
  }
}
