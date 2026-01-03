import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { VisitorParcelService, VisitorParcel } from '../../services/visitor-parcel.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-subtitle">Overview of all system activities</p>
      </div>
      
      <div class="card-grid">
        <div class="stats-card">
          <div class="stats-content">
            <mat-icon class="stats-icon visitors">people</mat-icon>
            <div>
              <h3 class="stats-number">{{totalVisitors}}</h3>
              <p class="stats-label">Total Visitors</p>
            </div>
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-content">
            <mat-icon class="stats-icon parcels">local_shipping</mat-icon>
            <div>
              <h3 class="stats-number">{{totalParcels}}</h3>
              <p class="stats-label">Total Parcels</p>
            </div>
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-content">
            <mat-icon class="stats-icon pending">pending</mat-icon>
            <div>
              <h3 class="stats-number">{{pendingApprovals}}</h3>
              <p class="stats-label">Pending Approvals</p>
            </div>
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-content">
            <mat-icon class="stats-icon active">check_circle</mat-icon>
            <div>
              <h3 class="stats-number">{{activeVisitors}}</h3>
              <p class="stats-label">Active Visitors</p>
            </div>
          </div>
        </div>
      </div>
      
      <mat-card class="data-card">
        <mat-tab-group class="modern-tabs">
          <mat-tab label="All Visitors">
            <div class="tab-content">
              <div class="records-grid">
                <div class="record-item" *ngFor="let visitor of visitors">
                  <div class="record-header">
                    <div class="record-info">
                      <h4 class="record-name">{{visitor.name}}</h4>
                      <p class="record-resident">{{visitor.resident_name}}</p>
                    </div>
                    <mat-chip class="status-badge" [class]="'status-' + visitor.status.toLowerCase().replace(' ', '-')">
                      {{visitor.status}}
                    </mat-chip>
                  </div>
                  <div class="record-details">
                    <div class="detail-item">
                      <mat-icon>description</mat-icon>
                      <span>{{visitor.purpose_description}}</span>
                    </div>
                    <div class="detail-item">
                      <mat-icon>security</mat-icon>
                      <span>{{visitor.security_guard_name}}</span>
                    </div>
                    <div class="detail-item">
                      <mat-icon>schedule</mat-icon>
                      <span>{{visitor.created_at | date:'medium'}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
          
          <mat-tab label="All Parcels">
            <div class="tab-content">
              <div class="records-grid">
                <div class="record-item" *ngFor="let parcel of parcels">
                  <div class="record-header">
                    <div class="record-info">
                      <h4 class="record-name">{{parcel.name}}</h4>
                      <p class="record-resident">{{parcel.resident_name}}</p>
                    </div>
                    <mat-chip class="status-badge" [class]="'status-' + parcel.status.toLowerCase().replace(' ', '-')">
                      {{parcel.status}}
                    </mat-chip>
                  </div>
                  <div class="record-details">
                    <div class="detail-item">
                      <mat-icon>description</mat-icon>
                      <span>{{parcel.purpose_description}}</span>
                    </div>
                    <div class="detail-item">
                      <mat-icon>security</mat-icon>
                      <span>{{parcel.security_guard_name}}</span>
                    </div>
                    <div class="detail-item">
                      <mat-icon>schedule</mat-icon>
                      <span>{{parcel.created_at | date:'medium'}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .stats-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stats-icon.visitors {
      background: #dbeafe;
      color: #1d4ed8;
    }
    
    .stats-icon.parcels {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .stats-icon.pending {
      background: #fef3c7;
      color: #d97706;
    }
    
    .stats-icon.active {
      background: #f3e8ff;
      color: #7c3aed;
    }
    
    .data-card {
      margin-top: 32px;
      background: white;
    }
    
    .modern-tabs {
      background: transparent;
    }
    
    .tab-content {
      padding: 24px 0;
    }
    
    .records-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
    
    .record-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
    }
    
    .record-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    
    .record-info {
      flex: 1;
    }
    
    .record-name {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 4px 0;
    }
    
    .record-resident {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
    
    .record-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: #475569;
    }
    
    .detail-item mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
      color: #64748b;
    }
    
    .status-badge {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  visitors: VisitorParcel[] = [];
  parcels: VisitorParcel[] = [];
  totalVisitors = 0;
  totalParcels = 0;
  pendingApprovals = 0;
  activeVisitors = 0;

  constructor(private visitorParcelService: VisitorParcelService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.visitorParcelService.getAll({ type: 'Visitor' }).subscribe({
      next: (response) => {
        this.visitors = response.data;
        this.totalVisitors = this.visitors.length;
        this.pendingApprovals = this.visitors.filter(v => 
          v.status === 'New' || v.status === 'Waiting for Approval'
        ).length;
        this.activeVisitors = this.visitors.filter(v => 
          v.status === 'Approved' || v.status === 'Entered'
        ).length;
      }
    });

    this.visitorParcelService.getAll({ type: 'Parcel' }).subscribe({
      next: (response) => {
        this.parcels = response.data;
        this.totalParcels = this.parcels.length;
      }
    });
  }
}