import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JsonPipe, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { UserService, UserDto } from '../../../../core/services/user.service';

@Component({
  selector: 'app-administration-users-page',
  standalone: true,
  imports: [
    NgIf,
    JsonPipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './administration-users-page.component.html',
  styleUrl: './administration-users-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministrationUsersPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly users = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);

  public busy = false;
  public createdUser: UserDto | null = null;

  public readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  public create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Please fill valid user info.', 'Close', { duration: 2500 });
      return;
    }

    this.busy = true;

    this.users.createUser(this.form.getRawValue()).pipe(
      finalize(() => {
        this.busy = false;
      })
    ).subscribe({
      next: (user) => {
        this.createdUser = user;
        this.snackBar.open('User created successfully.', 'Close', { duration: 2500 });
        this.form.reset();
      },
      error: () => {
        this.snackBar.open('Create user failed. Check API.', 'Close', { duration: 3000 });
      }
    });
  }
}
