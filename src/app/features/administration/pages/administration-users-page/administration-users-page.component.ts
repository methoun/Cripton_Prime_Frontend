import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

import { AdminUser } from '../../models/admin-user.model';
import { UserCreateDialogComponent } from './user-create-dialog/user-create-dialog.component';

// ✅ Put route metadata OUTSIDE decorator/class body
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
  ],
  templateUrl: './administration-users-page.component.html',
  styleUrls: ['./administration-users-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdministrationUsersPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  users: AdminUser[] = [];
  displayedColumns: Array<keyof AdminUser> = ['id', 'username', 'fullName', 'email'];

  openCreateDialog(): void {
    const ref = this.dialog.open(UserCreateDialogComponent, {
      width: '620px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((created) => {
      if (!created) return;

      this.users = [created, ...this.users];
      this.snack.open('User created successfully', 'OK', { duration: 2500 });
    });
  }
}