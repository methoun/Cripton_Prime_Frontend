import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AdminUser } from '../../models/admin-user.model';
import { AdminUserService } from '../../services/admin-user.service';
import { UserCreateDialogComponent } from './user-create-dialog/user-create-dialog.component';
import {
  UiConfirmDialogComponent,
  UiTableAction,
  UiTableColumn,
  UiTableComponent,
} from '../../../../shared/ui';

export const DB_ROUTE = '/admin/user-setup/user-list';

@Component({
  selector: 'app-administration-users-page',
  standalone: true,
  imports: [UiTableComponent, MatSnackBarModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './administration-users-page.component.html',
  styleUrls: ['./administration-users-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdministrationUsersPageComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly adminUsers = inject(AdminUserService);

  loading = false;
  rows: AdminUser[] = [];

  readonly rowActions: UiTableAction<AdminUser>[] = [
    {
      icon: 'edit',
      label: 'Edit user',
      color: 'primary',
      onClick: (row: AdminUser) => this.editUser(row),
    },
    {
      icon: 'delete',
      label: 'Delete user',
      color: 'warn',
      onClick: (row: AdminUser) => this.deleteUser(row),
    },
  ];

  readonly columns: UiTableColumn<AdminUser>[] = [
    { key: 'username', header: 'Username', value: (row: AdminUser) => row.username, width: '22%' },
    { key: 'email', header: 'Email', value: (row: AdminUser) => row.email, kind: 'email', width: '30%' },
    { key: 'role', header: 'Role', value: (row: AdminUser) => row.role || '-', kind: 'role', width: '16%' },
    {
      key: 'status',
      header: 'Status',
      value: (row: AdminUser) => (row.isActive ? 'Active' : 'Inactive'),
      kind: 'status',
      sortable: false,
      width: '14%',
      statusResolver: (row: AdminUser) => !!row.isActive,
    },
    {
      key: 'actions',
      header: 'Actions',
      kind: 'actions',
      sortable: false,
      align: 'center',
      width: '12%',
      actions: this.rowActions,
    },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminUsers.getAll().subscribe({
      next: (users: AdminUser[]) => {
        this.rows = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load users', 'OK', { duration: 2500 });
      },
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(UserCreateDialogComponent, {
      width: '620px',
      maxWidth: '95vw',
      data: { mode: 'create' },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((changed: boolean | undefined) => {
      if (!changed) return;
      this.loadUsers();
      this.snack.open('User created successfully', 'OK', { duration: 2500 });
    });
  }

  editUser(user: AdminUser): void {
    const ref = this.dialog.open(UserCreateDialogComponent, {
      width: '620px',
      maxWidth: '95vw',
      data: { mode: 'edit', user },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((changed: boolean | undefined) => {
      if (!changed) return;
      this.loadUsers();
      this.snack.open('User updated successfully', 'OK', { duration: 2500 });
    });
  }

  deleteUser(user: AdminUser): void {
    const ref = this.dialog.open(UiConfirmDialogComponent, {
      width: '420px',
      maxWidth: '92vw',
      data: {
        title: 'Delete user',
        message: `Are you sure you want to delete "${user.username}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        danger: true,
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.adminUsers.delete(user.id).subscribe({
        next: () => {
          this.rows = this.rows.filter((x) => x.id !== user.id);
          this.snack.open('User deleted successfully', 'OK', { duration: 2500 });
        },
        error: () => {
          this.snack.open('Failed to delete user', 'OK', { duration: 2500 });
        },
      });
    });
  }
}
