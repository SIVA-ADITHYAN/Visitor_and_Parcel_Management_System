import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorParcelService, VisitorParcel } from '../../services/visitor-parcel.service';
import { AdminService, DashboardStats, QuickActions, Reports } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <h2>Admin Dashboard</h2>
      
      <!-- Stats Overview -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <h3>Total Visitors</h3>
            <div class="stat-number">{{stats?.visitors?.total_visitors || 0}}</div>
            <div class="stat-detail">Today: {{stats?.visitors?.today_visitors || 0}}</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <h3>Total Parcels</h3>
            <div class="stat-number">{{stats?.parcels?.total_parcels || 0}}</div>
            <div class="stat-detail">Today: {{stats?.parcels?.today_parcels || 0}}</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <h3>Pending Actions</h3>
            <div class="stat-number">{{(stats?.visitors?.pending_visitors || 0) + (stats?.parcels?.pending_parcels || 0)}}</div>
            <div class="stat-detail">Needs attention</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <h3>Active Visitors</h3>
            <div class="stat-number">{{stats?.visitors?.active_visitors || 0}}</div>
            <div class="stat-detail">Currently inside</div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <mat-tab-group>
        <!-- Quick Actions Tab -->
        <mat-tab label="Quick Actions">
          <div class="tab-content">
            <div class="quick-actions-grid">
              <!-- Recent Activities -->
              <mat-card class="action-card">
                <mat-card-header>
                  <mat-card-title>Recent Activities (24h)</mat-card-title>
                  <button mat-button (click)="refreshQuickActions()">Refresh</button>
                </mat-card-header>
                <mat-card-content>
                  <div *ngFor="let activity of quickActions?.recentActivities" class="activity-item">
                    <div class="activity-info">
                      <strong>{{activity.name}}</strong> ({{activity.type}})
                      <br><small>{{activity.resident_name}} - {{activity.created_at | date:'short'}}</small>
                    </div>
                    <mat-chip [color]="getStatusColor(activity.status)">{{activity.status}}</mat-chip>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <!-- Pending Approvals -->
              <mat-card class="action-card">
                <mat-card-header>
                  <mat-card-title>Pending Approvals</mat-card-title>
                  <button mat-button (click)="bulkApprove()" [disabled]="selectedItems.length === 0">Bulk Approve</button>
                </mat-card-header>
                <mat-card-content>
                  <div *ngFor="let item of quickActions?.pendingApprovals" class="pending-item">
                    <input type="checkbox" [value]="item.id" (change)="toggleSelection(item.id, $event)">
                    <div class="item-info">
                      <strong>{{item.name}}</strong> ({{item.type}})
                      <br><small>{{item.resident_name}} - {{item.purpose_description}}</small>
                    </div>
                    <button mat-button (click)="quickApprove(item.id)">Approve</button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
        
        <!-- Reports Tab -->
        <mat-tab label="Reports">
          <div class="tab-content">
            <div class="report-controls">
              <mat-select [(value)]="reportPeriod" (selectionChange)="loadReports()">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </mat-select>
              
              <mat-select [(value)]="reportType" (selectionChange)="loadReports()">
                <option value="">All Types</option>
                <option value="Visitor">Visitors Only</option>
                <option value="Parcel">Parcels Only</option>
              </mat-select>
              
              <button mat-button (click)="exportData()">Export Data</button>
            </div>
            
            <div class="reports-grid">
              <!-- Status Distribution -->
              <mat-card class="report-card">
                <mat-card-header>
                  <mat-card-title>Status Distribution</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div *ngFor="let stat of reports?.statusStats" class="status-stat">
                    <span>{{stat.status}} ({{stat.type}}): </span>
                    <strong>{{stat.count}}</strong>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <!-- Top Residents -->
              <mat-card class="report-card">
                <mat-card-header>
                  <mat-card-title>Most Active Residents</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div *ngFor="let resident of reports?.residentStats" class="resident-stat">
                    <div>{{resident.resident_name}}</div>
                    <div class="resident-numbers">
                      <span>Total: {{resident.total_entries}}</span>
                      <span>Visitors: {{resident.visitors}}</span>
                      <span>Parcels: {{resident.parcels}}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
        
        <!-- All Records Tab -->
        <mat-tab label="All Records">
          <div class="tab-content">
            <div class="records-controls">
              <mat-select [(value)]="filterType" (selectionChange)="loadAllData()">
                <option value="">All Types</option>
                <option value="Visitor">Visitors</option>
                <option value="Parcel">Parcels</option>
              </mat-select>
              
              <mat-select [(value)]="filterStatus" (selectionChange)="loadAllData()">
                <option value="">All Status</option>
                <option value="New">New</option>
                <option value="Approved">Approved</option>
                <option value="Entered">Entered</option>
                <option value="Exited">Exited</option>
                <option value="Received">Received</option>
                <option value="Collected">Collected</option>
              </mat-select>
            </div>
            
            <div class="records-list">
              <mat-card *ngFor="let record of allRecords" class="record-card">
                <mat-card-header>
                  <mat-card-title>{{record.name}}</mat-card-title>
                  <mat-card-subtitle>
                    <mat-chip [color]="getStatusColor(record.status)">{{record.status}}</mat-chip>
                    <mat-chip>{{record.type}}</mat-chip>
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p><strong>Resident:</strong> {{record.resident_name}}</p>
                  <p><strong>Purpose:</strong> {{record.purpose_description}}</p>
                  <p><strong>Security Guard:</strong> {{record.security_guard_name}}</p>
                  <p><strong>Date:</strong> {{record.created_at | date:'medium'}}</p>
                  <p *ngIf="record.notes"><strong>Notes:</strong> {{record.notes}}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 20px auto;
      padding: 20px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      text-align: center;
    }
    .stat-number {
      font-size: 2.5em;
      font-weight: bold;
      color: #1976d2;
    }
    .stat-detail {
      color: #666;
      font-size: 0.9em;
    }
    .tab-content {
      padding: 20px 0;
    }
    .quick-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .action-card {
      height: 400px;
      overflow-y: auto;
    }
    .activity-item, .pending-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .report-controls, .records-controls {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    .reports-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .report-card {
      height: 300px;
      overflow-y: auto;
    }
    .status-stat, .resident-stat {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .resident-numbers {
      display: flex;
      gap: 12px;
      font-size: 0.9em;
      color: #666;
    }
    .records-list {
      max-height: 600px;
      overflow-y: auto;
    }
    .record-card {
      margin-bottom: 16px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  quickActions: QuickActions | null = null;
  reports: Reports | null = null;
  allRecords: VisitorParcel[] = [];
  
  selectedItems: number[] = [];
  reportPeriod = 'week';
  reportType = '';
  filterType = '';
  filterStatus = '';

  constructor(
    private adminService: AdminService,
    private visitorParcelService: VisitorParcelService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadQuickActions();
    this.loadReports();
    this.loadAllData();
  }

  loadDashboardStats(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  loadQuickActions(): void {
    this.adminService.getQuickActions().subscribe({
      next: (actions) => this.quickActions = actions,
      error: (error) => console.error('Error loading quick actions:', error)
    });
  }

  refreshQuickActions(): void {
    this.loadQuickActions();
    this.loadDashboardStats();
  }

  loadReports(): void {
    this.adminService.getReports(this.reportPeriod, this.reportType).subscribe({
      next: (reports) => this.reports = reports,
      error: (error) => console.error('Error loading reports:', error)
    });
  }

  loadAllData(): void {
    const filters: any = {};
    if (this.filterType) filters.type = this.filterType;
    if (this.filterStatus) filters.status = this.filterStatus;
    
    this.visitorParcelService.getAll(filters).subscribe({
      next: (response) => this.allRecords = response.data,
      error: (error) => console.error('Error loading records:', error)
    });
  }

  toggleSelection(id: number, event: any): void {
    if (event.target.checked) {
      this.selectedItems.push(id);
    } else {
      this.selectedItems = this.selectedItems.filter(item => item !== id);
    }
  }

  quickApprove(id: number): void {
    this.visitorParcelService.updateStatus(id, { status: 'Approved' }).subscribe({
      next: () => {
        this.refreshQuickActions();
        this.loadAllData();
      },
      error: (error) => console.error('Error approving:', error)
    });
  }

  bulkApprove(): void {
    if (this.selectedItems.length === 0) return;
    
    this.adminService.bulkStatusUpdate(this.selectedItems, 'Approved').subscribe({
      next: () => {
        this.selectedItems = [];
        this.refreshQuickActions();
        this.loadAllData();
      },
      error: (error) => console.error('Error bulk approving:', error)
    });
  }

  exportData(): void {
    this.adminService.exportData(this.reportPeriod, this.reportType).subscribe({
      next: (data) => {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vpms-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exporting data:', error)
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'New':
      case 'Waiting for Approval':
      case 'Received':
        return 'warn';
      case 'Approved':
      case 'Entered':
      case 'Acknowledged':
        return 'primary';
      case 'Exited':
      case 'Collected':
        return 'accent';
      default:
        return '';
    }
  }
}