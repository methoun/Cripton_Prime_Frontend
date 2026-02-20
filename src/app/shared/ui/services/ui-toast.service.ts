import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type UiToastType = 'success' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class UiToastService {
  private readonly snack = inject(MatSnackBar);

  show(message: string, type: UiToastType = 'info', action = 'OK', durationMs = 3000) {
    this.snack.open(message, action, {
      duration: durationMs,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`ui-toast`, `ui-toast--${type}`],
    });
  }
}
