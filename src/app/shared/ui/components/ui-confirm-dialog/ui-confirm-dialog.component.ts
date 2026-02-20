import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UI_IMPORTS } from '../../ui-imports';

export interface UiConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Component({
  selector: 'ui-confirm-dialog',
  standalone: true,
  imports: [...UI_IMPORTS],
  templateUrl: './ui-confirm-dialog.component.html',
  styleUrls: ['./ui-confirm-dialog.component.scss'],
})
export class UiConfirmDialogComponent {
  constructor(
    private readonly ref: MatDialogRef<UiConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public readonly data: UiConfirmDialogData
  ) {}

  cancel() { this.ref.close(false); }
  confirm() { this.ref.close(true); }
}
