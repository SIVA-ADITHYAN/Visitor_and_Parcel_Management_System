import { Routes } from '@angular/router';
import { LoginComponent } from './components/login-simple.component';
import { SignupComponent } from './components/signup-simple.component';
import { AdminDashboardComponent } from './components/admin-dashboard-simple.component';
import { SecurityDashboardComponent } from './components/security-dashboard.component';
import { ResidentDashboardComponent } from './components/resident-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'Admin' }
  },
  { 
    path: 'security/dashboard', 
    component: SecurityDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'Security Guard' }
  },
  { 
    path: 'resident/dashboard', 
    component: ResidentDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'Resident' }
  },
  { path: '**', redirectTo: '/login' }
];
