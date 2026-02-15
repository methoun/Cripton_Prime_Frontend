import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap, catchError, of } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../../core/services/auth.service';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
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

  // ✅ Dummy data (later API)
  public readonly companies = [
    { id: '32434cc64a5f7-d939-4725-ac7c-0c483d30d34d', name: 'CriptonPrime Limited' },
    { id: '4d4c8c39-5870-431a-890c-6222363166a4', name: 'Demo Group' }
  ];

  public readonly offices = [
    { id: '02fe6dfb-32df-4358-a6ff-91c0b43dd6e3', name: 'Head Office' },
    { id: 'c2102c8b-f08a-4c49-9695-07a66da2f1f4', name: 'Branch Office' }
  ];

  public readonly form = this.fb.nonNullable.group({
    companyId: [this.companies[0].id, [Validators.required]],
    officeId: [this.offices[0].id, [Validators.required]],
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

    const v = this.form.getRawValue();

    // ✅ Map to your existing LoginRequest shape (company/office string)
    const payload = {
      company: this.companies.find(x => x.id === v.companyId)?.name ?? '',
      office: this.offices.find(x => x.id === v.officeId)?.name ?? '',
      username: v.username,
      password: v.password
    };

    this.auth.login(payload).pipe(
      switchMap(() =>
        this.navigation.getModules().pipe(
          catchError(() => of(null))
        )
      ),
      finalize(() => (this.busy = false))
    ).subscribe({
      next: () => this.router.navigateByUrl('/landing'),
      error: () => this.snackBar.open('Login failed. Please check credentials.', 'Close', { duration: 3000 })
    });
  }

  public togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public onForgotPassword(): void {
    this.snackBar.open('Forgot password is not implemented yet.', 'Close', { duration: 2500 });
  }
}
