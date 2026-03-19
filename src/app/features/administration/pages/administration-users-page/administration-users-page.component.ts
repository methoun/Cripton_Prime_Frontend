import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AdminUser } from '../../models/admin-user.model';
import { AdminUserService } from '../../services/admin-user.service';
import { UserCreateDialogComponent } from './user-create-dialog/user-create-dialog.component';
import {
  UiButtonComponent,
  UiConfirmDialogComponent,
  UiTableAction,
  UiTableColumn,
  UiTableComponent,
} from '../../../../shared/ui';

export const DB_ROUTE = '/admin/user-setup/user-list';

@Component({
  selector: 'app-administration-users-page',
  standalone: true,
  imports: [
    UiTableComponent,
    UiButtonComponent,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './administration-users-page.component.html',
  styleUrls: ['./administration-users-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdministrationUsersPageComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly adminUsers = inject(AdminUserService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  rows: AdminUser[] = [];

  readonly rowActions: UiTableAction<AdminUser>[] = [
    {
      key: 'edit',
      icon: 'edit',
      label: 'Edit user',
      color: 'primary',
      variant: 'icon',
      tooltip: 'Edit user',
    },
    {
      key: 'delete',
      icon: 'delete',
      label: 'Delete user',
      color: 'warn',
      variant: 'icon',
      tooltip: 'Delete user',
    },
  ];

  readonly columns: UiTableColumn<AdminUser>[] = [
    {
      key: 'username',
      header: 'User Name',
      sortable: true,
      width: '22%',
      formatter: (row: AdminUser) => row.username ?? '',
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      width: '30%',
      formatter: (row: AdminUser) => row.email ?? '',
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      width: '16%',
      formatter: (row: AdminUser) => row.role || '-',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '14%',
      formatter: (row: AdminUser) => (row.isActive ? 'Active' : 'Inactive'),
    },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.adminUsers.getAll().subscribe({
      next: (users: AdminUser[]) => {
        this.rows = users ?? [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load users', 'OK', { duration: 2500 });
        this.cdr.markForCheck();
      },
    });
  }

  onTableAction(event: { action: UiTableAction<AdminUser>; row: AdminUser }): void {
    switch (event.action.key) {
      case 'edit':
        this.editUser(event.row);
        break;
      case 'delete':
        this.deleteUser(event.row);
        break;
      default:
        break;
    }
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(UserCreateDialogComponent, {
      width: '620px',
      maxWidth: '95vw',
      data: { mode: 'create' },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((changed: boolean | undefined) => {
      if (!changed) {
        return;
      }

      this.loadUsers();
      this.snack.open('User created successfully', 'OK', { duration: 2500 });
      this.cdr.markForCheck();
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
      if (!changed) {
        return;
      }

      this.loadUsers();
      this.snack.open('User updated successfully', 'OK', { duration: 2500 });
      this.cdr.markForCheck();
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
      if (!confirmed) {
        return;
      }

      this.adminUsers.delete(user.id).subscribe({
        next: () => {
          this.rows = this.rows.filter((x: AdminUser) => x.id !== user.id);
          this.snack.open('User deleted successfully', 'OK', { duration: 2500 });
          this.cdr.markForCheck();
        },
        error: () => {
          this.snack.open('Failed to delete user', 'OK', { duration: 2500 });
          this.cdr.markForCheck();
        },
      });
    });
  }
}