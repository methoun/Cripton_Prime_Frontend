import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  AdmCompanyInfo,
  SaveAdmCompanyInfoRequest,
  UpdateAdmCompanyInfoRequest,
} from '../../models/adm-company-info.model';
import { AdmCompanyInfoService } from '../../services/adm-company-info.service';

interface CompanyInfoDialogData {
  model?: AdmCompanyInfo | null;
  mode?: 'create' | 'edit' | 'view';
}

@Component({
  standalone: true,
  selector: 'app-adm-company-info-form-modal',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './adm-company-info-form-modal.component.html',
  styleUrl: './adm-company-info-form-modal.component.scss',
})
export class AdmCompanyInfoFormModalComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdmCompanyInfoService);
  private readonly dialogRef = inject(MatDialogRef<AdmCompanyInfoFormModalComponent>, { optional: true });
  private readonly dialogData = inject<CompanyInfoDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  @Input() isOpen = false;
  @Input() model: AdmCompanyInfo | null = null;
  @Input() readOnly = false;

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
    isActive: [true],
  });

  constructor() {
    if (this.dialogData) {
      this.model = this.dialogData.model ?? null;
      this.readOnly = this.dialogData.mode === 'view';
    }
  }

  get isEdit(): boolean {
    return !!this.model?.compId;
  }

  get dialogTitle(): string {
    if (this.readOnly) return 'View Company';
    return this.isEdit ? 'Edit Company' : 'Create Company';
  }

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model'] || changes['isOpen'] || changes['readOnly']) {
      this.resetForm();
    }
  }

  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close(false);
      return;
    }
    this.cancel.emit();
  }

  save(): void {
    if (this.readOnly) {
      this.close();
      return;
    }

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
      isActive: raw.isActive ?? true,
    };

    const request$ = this.isEdit
      ? this.service.update({
          compId: this.model!.compId,
          ...createPayload,
        } as UpdateAdmCompanyInfoRequest)
      : this.service.create(createPayload);

    this.saving = true;
    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.saved.emit();
          }
        },
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
      isActive: this.model?.isActive ?? true,
    });

    if (this.readOnly) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }
}
