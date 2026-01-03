import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Resident' | 'Security Guard' | 'Admin';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="app-container">
      <mat-toolbar color="primary" *ngIf="currentUser || isLoggedIn" class="modern-toolbar">
        <div class="toolbar-content">
          <div class="brand">
            <span class="brand-text">VPMS</span>
            <span class="role-badge">{{currentUser?.role || 'Guest'}}</span>
          </div>
          
          <div class="user-section">
            <span class="welcome-text">{{currentUser?.name || 'User'}}</span>
            <button mat-button [matMenuTriggerFor]="menu" class="user-menu">
              👤
            </button>
          </div>
        </div>
        
        <mat-menu #menu="matMenu" class="user-dropdown">
          <div class="menu-header">
            👤
            <div>
              <div class="menu-name">{{currentUser?.name || 'User'}}</div>
              <div class="menu-email">{{currentUser?.email || 'No email'}}</div>
            </div>
          </div>
          <mat-divider></mat-divider>
          
          <button mat-menu-item (click)="navigate('/admin/dashboard')">
            📊 Admin Dashboard
          </button>
          <button mat-menu-item (click)="navigate('/security/dashboard')">
            🛡️ Security Dashboard
          </button>
          <button mat-menu-item (click)="navigate('/resident/dashboard')">
            🏠 Resident Dashboard
          </button>
          
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()" class="logout-item">
            🚪 Logout
          </button>
        </mat-menu>
      </mat-toolbar>
      
      <main class="main-content" [class.with-toolbar]="currentUser">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
    }
    
    .modern-toolbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border-bottom: none;
    }
    
    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .brand-icon {
      font-size: 28px;
      height: 28px;
      width: 28px;
    }
    
    .brand-text {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    
    .role-badge {
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      backdrop-filter: blur(10px);
    }
    
    .user-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .welcome-text {
      font-weight: 500;
      font-size: 14px;
    }
    
    .user-menu {
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
    }
    
    .main-content {
      flex: 1;
      overflow-y: auto;
      background: #f8fafc;
    }
    
    .main-content.with-toolbar {
      padding-top: 0;
    }
    
    ::ng-deep .user-dropdown {
      margin-top: 8px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    }
    
    ::ng-deep .menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px 12px 0 0;
    }
    
    ::ng-deep .menu-name {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }
    
    ::ng-deep .menu-email {
      font-size: 12px;
      color: #666;
    }
    
    ::ng-deep .logout-item {
      color: #ef4444 !important;
    }
    
    ::ng-deep .logout-item mat-icon {
      color: #ef4444 !important;
    }
  `]
})
export class AppComponent {
  title = 'vpms-frontend';
  currentUser: User | null = null;
  isLoggedIn = false;

  constructor(
    private router: Router
  ) {
    // Check if user is logged in and get user data
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isLoggedIn = !this.router.url.includes('/login') && !this.router.url.includes('/signup') && this.router.url !== '/';
      
      // Load user data from localStorage if logged in
      if (this.isLoggedIn) {
        const userData = localStorage.getItem('user');
        if (userData) {
          this.currentUser = JSON.parse(userData);
        }
      }
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.currentUser = null;
    this.isLoggedIn = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
