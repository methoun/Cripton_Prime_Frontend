import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../../core/services/auth.service';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly navigation = inject(NavigationService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  public hidePassword = true;
  public busy = false;

  public readonly form = this.fb.nonNullable.group({
    company: ['CriptonPrime Limited', [Validators.required]],
    office: ['Head Office', [Validators.required]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Please fill required fields.', 'Close', { duration: 2500 });
      return;
    }

    this.busy = true;

    this.auth.login(this.form.getRawValue()).pipe(
      finalize(() => {
        this.busy = false;
      })
    ).subscribe({
      next: () => {
        this.navigation.getModules().subscribe({
          next: () => {
            this.router.navigateByUrl('/landing');
          },
          error: () => {
            this.router.navigateByUrl('/landing');
          }
        });
      },
      error: () => {
        this.snackBar.open('Login failed. Please check credentials.', 'Close', { duration: 3000 });
      }
    });
  }

  public togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }
}
