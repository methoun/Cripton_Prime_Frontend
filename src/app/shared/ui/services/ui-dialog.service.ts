import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';

export interface UiDialogOptions<D = any> {
  width?: string;
  maxWidth?: string;
  data?: D;
  disableClose?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UiDialogService {
  private readonly dialog = inject(MatDialog);

  open<T, D = any, R = any>(component: ComponentType<T>, options: UiDialogOptions<D> = {}): Observable<R | undefined> {
    const ref = this.dialog.open(component, {
      width: options.width ?? '720px',
      maxWidth: options.maxWidth ?? '95vw',
      data: options.data,
      disableClose: options.disableClose ?? false,
      autoFocus: false,
      restoreFocus: true,
    });

    return ref.afterClosed();
  }
}
