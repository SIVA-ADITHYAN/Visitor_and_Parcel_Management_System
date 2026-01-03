import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>VPMS</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" required>
            <span matSuffix class="suffix-icon">📧</span>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button" class="toggle-btn">
              <span>{{hidePassword ? '👁️' : '🙈'}}</span>
            </button>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="loginForm.invalid || loading" class="submit-btn">
            <span *ngIf="loading" class="spinning">⏳</span>
            <span *ngIf="!loading">🔐</span>
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? 
            <button mat-button color="primary" (click)="goToSignup()">Create Account</button>
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
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .logo .icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
      color: #667eea;
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
    
    .logo h1 {
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin: 0;
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
      gap: 24px;
    }
    
    .form-field {
      width: 100%;
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
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      
      // Make actual API call to backend
      fetch('http://localhost:3003/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      .then(response => response.json())
      .then(data => {
        this.loading = false;
        if (data.token) {
          // Store user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Route based on actual user role from backend
          const role = data.user.role;
          if (role === 'Admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'Security Guard') {
            this.router.navigate(['/security/dashboard']);
          } else if (role === 'Resident') {
            this.router.navigate(['/resident/dashboard']);
          }
        } else {
          this.snackBar.open(data.message || 'Login failed', 'Close', { duration: 3000 });
        }
      })
      .catch(error => {
        this.loading = false;
        this.snackBar.open('Login failed - Backend not connected', 'Close', { duration: 3000 });
      });
    }
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}