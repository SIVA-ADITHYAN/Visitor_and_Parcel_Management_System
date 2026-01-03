import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>VPMS</h1>
          <h2>Create Account</h2>
          <p>Join our Visitor & Parcel Management System</p>
        </div>
        
        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" required>
            <span matSuffix class="suffix-icon">👤</span>
            <mat-error *ngIf="signupForm.get('name')?.hasError('required')">
              Name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" required>
            <span matSuffix class="suffix-icon">📧</span>
            <mat-error *ngIf="signupForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="signupForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button" class="toggle-btn">
              <span>{{hidePassword ? '👁️' : '🙈'}}</span>
            </button>
            <mat-error *ngIf="signupForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
            <mat-error *ngIf="signupForm.get('password')?.hasError('minlength')">
              Password must be at least 6 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role" required>
              <mat-option value="Resident">🏠 Resident</mat-option>
              <mat-option value="Security Guard">🛡️ Security Guard</mat-option>
              <mat-option value="Admin">👑 Admin</mat-option>
            </mat-select>
            <span matSuffix class="suffix-icon">🎭</span>
            <mat-error *ngIf="signupForm.get('role')?.hasError('required')">
              Please select a role
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Contact Number</mat-label>
            <input matInput formControlName="contact_info" placeholder="+1234567890">
            <span matSuffix class="suffix-icon">📞</span>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="signupForm.invalid || loading" class="submit-btn">
            <span *ngIf="loading" class="spinning">⏳</span>
            <span *ngIf="!loading">➕</span>
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Already have an account? 
            <button mat-button color="primary" (click)="goToLogin()">Sign In</button>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .auth-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .auth-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin: 0 0 24px 0;
    }
    
    .auth-header h2 {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px 0;
    }
    
    .auth-header p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .form-field {
      width: 100%;
    }
    
    .suffix-icon {
      font-size: 18px;
      color: #64748b;
    }
    
    .toggle-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
    }
    
    .submit-btn {
      height: 52px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      margin-top: 8px;
      text-transform: none;
    }
    
    .auth-footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }
    
    .auth-footer p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    
    .spinning {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      contact_info: ['']
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.loading = true;
      const formData = this.signupForm.value;
      
      // Make actual API call to backend
      fetch('http://localhost:3003/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => {
        this.loading = false;
        if (data.message === 'User registered successfully') {
          this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/login']);
        } else {
          this.snackBar.open(data.message || 'Registration failed', 'Close', { duration: 3000 });
        }
      })
      .catch(error => {
        this.loading = false;
        this.snackBar.open('Registration failed - Backend not connected', 'Close', { duration: 3000 });
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}