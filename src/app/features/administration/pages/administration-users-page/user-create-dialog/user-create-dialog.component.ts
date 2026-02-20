import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';

import { AdminUserService } from '../../../services/admin-user.service';
import { AdminUser, CreateAdminUserPayload } from '../../../models/admin-user.model';

@Component({
  selector: 'app-user-create-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './user-create-dialog.component.html',
  styleUrls: ['./user-create-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminUsers = inject(AdminUserService);
  private readonly ref = inject(MatDialogRef<UserCreateDialogComponent, AdminUser | null>);

  loading = false;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  close(): void {
    this.ref.close(null);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateAdminUserPayload = {
      username: this.form.controls.username.value.trim(),
      fullName: this.form.controls.fullName.value.trim(),
      email: this.form.controls.email.value.trim(),
    };

    this.loading = true;

    this.adminUsers
      .create(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (created) => this.ref.close(created),
        error: () => this.ref.close(null),
      });
  }
}
