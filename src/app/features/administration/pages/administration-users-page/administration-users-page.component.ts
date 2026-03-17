import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { AdminUser } from '../../models/admin-user.model';
import { AdminUserService } from '../../services/admin-user.service';
import { UserCreateDialogComponent } from './user-create-dialog/user-create-dialog.component';

export const DB_ROUTE = '/admin/user-setup/user-list';

@Component({
  selector: 'app-administration-users-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './administration-users-page.component.html',
  styleUrls: ['./administration-users-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdministrationUsersPageComponent implements OnInit, AfterViewInit {
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly adminUsers = inject(AdminUserService);

  readonly displayedColumns: string[] = ['username', 'email', 'role', 'status', 'actions'];
  readonly dataSource = new MatTableDataSource<AdminUser>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (user: AdminUser, filter: string): boolean => {
      const value = filter.trim().toLowerCase();
      return (
        String(user.username ?? '').toLowerCase().includes(value) ||
        String(user.email ?? '').toLowerCase().includes(value) ||
        String(user.role ?? '').toLowerCase().includes(value) ||
        (user.isActive ? 'active' : 'inactive').includes(value)
      );
    };
  }

  loadUsers(): void {
    this.loading = true;
    this.adminUsers.getAll().subscribe({
      next: (users) => {
        this.dataSource.data = users;
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
    const confirmed = window.confirm(`Delete user "${user.username}"?`);
    if (!confirmed) return;

    this.adminUsers.delete(user.id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((x) => x.id !== user.id);
        this.snack.open('User deleted successfully', 'OK', { duration: 2500 });
      },
      error: () => {
        this.snack.open('Failed to delete user', 'OK', { duration: 2500 });
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.dataSource.filter = value.trim().toLowerCase();
    this.paginator?.firstPage();
  }
}
