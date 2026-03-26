import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable, finalize } from 'rxjs';

import { AdminUserService } from '../../../services/admin-user.service';
import {
  AdminUser,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '../../../models/admin-user.model';
import {
  UiDynamicFormComponent,
  UiFormField,
  UiModalComponent,
} from '../../../../../shared/ui';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user?: AdminUser;
}

@Component({
  selector: 'app-user-create-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    UiModalComponent,
    UiDynamicFormComponent,
  ],
  templateUrl: './user-create-dialog.component.html',
  styleUrls: ['./user-create-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminUsers = inject(AdminUserService);
  private readonly ref = inject(MatDialogRef<UserCreateDialogComponent, boolean>);

  loading = false;

  readonly isEdit = this.data.mode === 'edit';

  readonly form = this.fb.nonNullable.group({
    username: [this.data.user?.username ?? '', [Validators.required]],
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    role: [this.data.user?.role ?? 'User', [Validators.required]],
    password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(4)]],
    isActive: [this.data.user?.isActive ?? true],
  });

  readonly fields: UiFormField[] = [
    {
      key: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'Enter username',
      required: true,
      colSpan: 6,
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter email address',
      required: true,
      colSpan: 6,
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      colSpan: 6,
      options: [
        { label: 'Admin', value: 'Admin' },
        { label: 'User', value: 'User' },
        { label: 'Manager', value: 'Manager' },
      ],
    },
    {
      key: 'password',
      label: this.isEdit ? 'Password (optional)' : 'Password',
      type: 'password',
      placeholder: 'Enter password',
      required: !this.isEdit,
      hint: this.isEdit ? 'Keep empty if you do not want to change password' : null as any,
      colSpan: 6,
    },
    ...(this.isEdit
  ? [
      {
        key: 'isActive',
        label: 'Active user',
        type: 'toggle' as const,
        colSpan: 12 as const,
      },
    ]
  : []),
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDialogData) {}

  close(): void {
    this.ref.close(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const value = this.form.getRawValue();

    let request$: Observable<unknown>;

    if (this.isEdit) {
      request$ = this.adminUsers.update(this.data.user!.id, {
        username: value.username.trim(),
        email: value.email.trim(),
        password: value.password.trim() || null,
        role: value.role?.trim() || null,
        isActive: value.isActive,
      } satisfies UpdateAdminUserPayload);
    } else {
      request$ = this.adminUsers.create({
        username: value.username.trim(),
        email: value.email.trim(),
        password: value.password.trim(),
        role: value.role?.trim() || null,
      } satisfies CreateAdminUserPayload);
    }

    request$
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: () => this.ref.close(true),
        error: () => this.ref.close(false),
      });
  }
}