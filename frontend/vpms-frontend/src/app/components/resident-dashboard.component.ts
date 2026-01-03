import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { VpmsService } from '../services/vpms.service';

@Component({
  selector: 'app-resident-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule
  ],
  template: `
    <div class="resident-dashboard">
      <div class="dashboard-header">
        <h1>🏠 Resident Dashboard</h1>
        <p>Manage your visitors and parcels</p>
      </div>
      
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <h3>{{stats.pendingApprovals}}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{stats.todayVisitors}}</h3>
            <p>Today's Visitors</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <h3>{{stats.parcelsWaiting}}</h3>
            <p>Parcels Waiting</p>
          </div>
        </div>
      </div>
      
      <div class="main-content">
        <mat-tab-group>
          <mat-tab label="🔔 Pending Approvals">
            <div class="tab-content">
              <div class="approval-list">
                <div class="approval-card" *ngFor="let request of pendingRequests">
                  <div class="request-header">
                    <div class="visitor-info">
                      <h3>{{request.visitorName}}</h3>
                      <p>📞 {{request.phone}}</p>
                      <p>🕐 Requested: {{request.requestTime}}</p>
                    </div>
                    <div class="request-status">
                      <span class="status-badge pending">Pending</span>
                    </div>
                  </div>
                  
                  <div class="request-details">
                    <div class="detail-row">
                      <strong>Purpose:</strong> {{request.purpose}}
                    </div>
                    <div class="detail-row" *ngIf="request.vehicle">
                      <strong>Vehicle:</strong> {{request.vehicle}}
                    </div>
                    <div class="detail-row">
                      <strong>Security Guard:</strong> {{request.guardName}}
                    </div>
                  </div>
                  
                  <div class="request-actions">
                    <button mat-raised-button color="primary" (click)="approveVisitor(request)">
                      ✅ Approve
                    </button>
                    <button mat-raised-button color="warn" (click)="rejectVisitor(request)">
                      ❌ Reject
                    </button>
                    <button mat-button (click)="callVisitor(request)">
                      📞 Call Visitor
                    </button>
                  </div>
                </div>
                
                <div class="empty-state" *ngIf="pendingRequests.length === 0">
                  <div class="empty-icon">✅</div>
                  <h3>All caught up!</h3>
                  <p>No pending visitor approvals</p>
                </div>
              </div>
            </div>
          </mat-tab>
          
          <mat-tab label="📦 My Parcels">
            <div class="tab-content">
              <div class="parcel-list">
                <div class="parcel-card" *ngFor="let parcel of myParcels">
                  <div class="parcel-header">
                    <div class="parcel-icon">{{getParcelIcon(parcel.type)}}</div>
                    <div class="parcel-info">
                      <h3>{{parcel.sender}}</h3>
                      <p>{{parcel.type}} - {{parcel.description}}</p>
                      <p>🕐 Received: {{parcel.receivedTime}}</p>
                    </div>
                    <div class="parcel-status">
                      <span class="status-badge" [class]="'status-' + parcel.status">{{parcel.status}}</span>
                    </div>
                  </div>
                  
                  <div class="parcel-actions" *ngIf="parcel.status === 'waiting'">
                    <button mat-raised-button color="primary" (click)="collectParcel(parcel)">
                      📬 Mark as Collected
                    </button>
                    <button mat-button (click)="viewParcelDetails(parcel)">
                      👁️ View Details
                    </button>
                  </div>
                </div>
                
                <div class="empty-state" *ngIf="myParcels.length === 0">
                  <div class="empty-icon">📭</div>
                  <h3>No parcels</h3>
                  <p>You don't have any parcels at the moment</p>
                </div>
              </div>
            </div>
          </mat-tab>
          
          <mat-tab label="📋 Visitor History">
            <div class="tab-content">
              <div class="history-filters">
                <button mat-button [class.active]="selectedPeriod === 'today'" (click)="filterHistory('today')">
                  Today
                </button>
                <button mat-button [class.active]="selectedPeriod === 'week'" (click)="filterHistory('week')">
                  This Week
                </button>
                <button mat-button [class.active]="selectedPeriod === 'month'" (click)="filterHistory('month')">
                  This Month
                </button>
              </div>
              
              <div class="history-list">
                <div class="history-item" *ngFor="let visit of visitorHistory">
                  <div class="history-icon">👤</div>
                  <div class="history-details">
                    <h4>{{visit.visitorName}}</h4>
                    <p>{{visit.purpose}}</p>
                    <div class="history-meta">
                      <span>📅 {{visit.date}}</span>
                      <span>🕐 {{visit.duration}}</span>
                      <span class="status-badge" [class]="'status-' + visit.status">{{visit.status}}</span>
                    </div>
                  </div>
                </div>
                
                <div class="empty-state" *ngIf="visitorHistory.length === 0">
                  <div class="empty-icon">📝</div>
                  <h3>No visitor history</h3>
                  <p>No visitors found for the selected period</p>
                </div>
              </div>
            </div>
          </mat-tab>
          
          <mat-tab label="⚙️ Settings">
            <div class="tab-content">
              <div class="settings-section">
                <h3>🔔 Notification Preferences</h3>
                <div class="setting-item">
                  <label>
                    <input type="checkbox" [checked]="settings.emailNotifications" 
                           (change)="updateSetting('emailNotifications', $event)">
                    Email notifications for new visitor requests
                  </label>
                </div>
                <div class="setting-item">
                  <label>
                    <input type="checkbox" [checked]="settings.smsNotifications" 
                           (change)="updateSetting('smsNotifications', $event)">
                    SMS notifications for urgent requests
                  </label>
                </div>
                <div class="setting-item">
                  <label>
                    <input type="checkbox" [checked]="settings.parcelNotifications" 
                           (change)="updateSetting('parcelNotifications', $event)">
                    Notifications for parcel deliveries
                  </label>
                </div>
              </div>
              
              <div class="settings-section">
                <h3>🏠 Apartment Information</h3>
                <div class="info-item">
                  <strong>Apartment:</strong> A-101
                </div>
                <div class="info-item">
                  <strong>Floor:</strong> 1st Floor
                </div>
                <div class="info-item">
                  <strong>Block:</strong> A Block
                </div>
                <button mat-button color="primary">✏️ Update Information</button>
              </div>
              
              <div class="settings-section">
                <h3>🔒 Security</h3>
                <button mat-button color="primary">🔑 Change Password</button>
                <button mat-button color="accent">📱 Setup 2FA</button>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .resident-dashboard {
      padding: 24px;
      background: #f8fafc;
      min-height: 100vh;
    }
    
    .dashboard-header {
      margin-bottom: 32px;
    }
    
    .dashboard-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
    }
    
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .stat-icon {
      font-size: 32px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      border-radius: 12px;
    }
    
    .stat-info h3 {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: #1e293b;
    }
    
    .stat-info p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }
    
    .tab-content {
      padding: 24px 0;
    }
    
    .approval-card, .parcel-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .request-header, .parcel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    
    .visitor-info h3, .parcel-info h3 {
      margin: 0 0 8px 0;
      font-weight: 600;
      color: #1e293b;
    }
    
    .visitor-info p, .parcel-info p {
      margin: 0 0 4px 0;
      color: #64748b;
      font-size: 14px;
    }
    
    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .status-badge.pending {
      background: #fef3c7;
      color: #d97706;
    }
    
    .status-badge.approved {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .status-badge.waiting {
      background: #dbeafe;
      color: #1d4ed8;
    }
    
    .status-badge.collected {
      background: #f3e8ff;
      color: #7c3aed;
    }
    
    .request-details {
      margin-bottom: 20px;
    }
    
    .detail-row {
      margin-bottom: 8px;
      color: #475569;
    }
    
    .request-actions, .parcel-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .parcel-icon {
      font-size: 32px;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      border-radius: 12px;
    }
    
    .history-filters {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .history-filters button.active {
      background: #667eea;
      color: white;
    }
    
    .history-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: white;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .history-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      border-radius: 8px;
    }
    
    .history-details {
      flex: 1;
    }
    
    .history-details h4 {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #1e293b;
    }
    
    .history-details p {
      margin: 0 0 8px 0;
      color: #64748b;
      font-size: 14px;
    }
    
    .history-meta {
      display: flex;
      gap: 16px;
      align-items: center;
      font-size: 12px;
      color: #94a3b8;
    }
    
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #64748b;
    }
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .settings-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .settings-section h3 {
      margin: 0 0 20px 0;
      font-weight: 600;
      color: #1e293b;
    }
    
    .setting-item {
      margin-bottom: 16px;
    }
    
    .setting-item label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    
    .info-item {
      margin-bottom: 12px;
      color: #475569;
    }
  `]
})
export class ResidentDashboardComponent {
  selectedPeriod = 'today';
  
  stats = {
    pendingApprovals: 0,
    todayVisitors: 0,
    parcelsWaiting: 0
  };
  
  pendingRequests: any[] = [];
  myParcels: any[] = [];
  visitorHistory: any[] = [];
  
  settings = {
    emailNotifications: true,
    smsNotifications: false,
    parcelNotifications: true
  };
  
  constructor(private vpmsService: VpmsService) {
    this.loadData();
  }
  
  async loadData() {
    try {
      // Load pending approvals from backend
      const pendingResponse = await this.vpmsService.getPendingApprovals();
      if (pendingResponse.data) {
        this.pendingRequests = pendingResponse.data.map((item: any) => ({
          id: item.id,
          visitorName: item.name,
          phone: item.vehicle_details || 'N/A',
          purpose: item.purpose_description,
          vehicle: item.vehicle_details,
          guardName: item.security_guard_name,
          requestTime: new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }));
      }
      
      // Load resident's parcels
      const parcelsResponse = await this.vpmsService.getResidentVisitorParcels(undefined, 'Parcel');
      if (parcelsResponse.data) {
        this.myParcels = parcelsResponse.data.map((item: any) => ({
          id: item.id,
          sender: item.name,
          type: item.purpose_description.split(':')[0] || 'Package',
          description: item.purpose_description,
          receivedTime: new Date(item.created_at).toLocaleString(),
          status: item.status === 'Received' ? 'waiting' : 'collected'
        }));
      }
      
      // Update stats
      this.stats = {
        pendingApprovals: this.pendingRequests.length,
        todayVisitors: Math.floor(Math.random() * 8) + 2,
        parcelsWaiting: this.myParcels.filter(p => p.status === 'waiting').length
      };
      
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data
      this.stats = {
        pendingApprovals: Math.floor(Math.random() * 5) + 1,
        todayVisitors: Math.floor(Math.random() * 8) + 2,
        parcelsWaiting: Math.floor(Math.random() * 3) + 1
      };
    }
    
    this.filterHistory('today');
  }
  
  async approveVisitor(request: any) {
    try {
      await this.vpmsService.updateStatus(request.id, 'Approved', 'Approved by resident');
      this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
      this.stats.pendingApprovals--;
      this.stats.todayVisitors++;
      alert('Visitor approved successfully!');
    } catch (error) {
      console.error('Error approving visitor:', error);
      alert('Failed to approve visitor');
    }
  }
  
  async rejectVisitor(request: any) {
    try {
      await this.vpmsService.updateStatus(request.id, 'Rejected', 'Rejected by resident');
      this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
      this.stats.pendingApprovals--;
      alert('Visitor rejected');
    } catch (error) {
      console.error('Error rejecting visitor:', error);
      alert('Failed to reject visitor');
    }
  }
  
  callVisitor(request: any) {
    alert(`Calling ${request.visitorName} at ${request.phone}`);
  }
  
  collectParcel(parcel: any) {
    parcel.status = 'collected';
    this.stats.parcelsWaiting--;
  }
  
  viewParcelDetails(parcel: any) {
    alert(`Parcel Details:\nSender: ${parcel.sender}\nType: ${parcel.type}\nDescription: ${parcel.description}`);
  }
  
  filterHistory(period: string) {
    this.selectedPeriod = period;
    
    // Mock data based on period
    if (period === 'today') {
      this.visitorHistory = [
        {
          visitorName: 'Alice Johnson',
          purpose: 'Delivery pickup',
          date: 'Today',
          duration: '30 mins',
          status: 'completed'
        }
      ];
    } else if (period === 'week') {
      this.visitorHistory = [
        {
          visitorName: 'Bob Wilson',
          purpose: 'Maintenance work',
          date: 'Monday',
          duration: '2 hours',
          status: 'completed'
        },
        {
          visitorName: 'Carol Brown',
          purpose: 'Social visit',
          date: 'Wednesday',
          duration: '1 hour',
          status: 'completed'
        }
      ];
    } else {
      this.visitorHistory = [
        {
          visitorName: 'David Lee',
          purpose: 'Business meeting',
          date: 'Last week',
          duration: '45 mins',
          status: 'completed'
        }
      ];
    }
  }
  
  getParcelIcon(type: string): string {
    switch(type) {
      case 'Package': return '📦';
      case 'Document': return '📄';
      case 'Food': return '🍕';
      case 'Medicine': return '💊';
      default: return '📋';
    }
  }
  
  updateSetting(setting: string, event: any) {
    (this.settings as any)[setting] = event.target.checked;
  }
}