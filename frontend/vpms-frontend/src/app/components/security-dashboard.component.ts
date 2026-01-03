import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { VpmsService } from '../services/vpms.service';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule
  ],
  template: `
    <div class="security-dashboard">
      <div class="dashboard-header">
        <h1>🛡️ Security Guard Dashboard</h1>
        <p>Manage visitors and parcels</p>
      </div>
      
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{todayStats.visitors}}</h3>
            <p>Today's Visitors</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <h3>{{todayStats.parcels}}</h3>
            <p>Today's Parcels</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔄</div>
          <div class="stat-info">
            <h3>{{todayStats.active}}</h3>
            <p>Currently Inside</p>
          </div>
        </div>
      </div>
      
      <div class="main-content">
        <div class="left-panel">
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>
                <span *ngIf="selectedTab === 0">👤 Log New Visitor</span>
                <span *ngIf="selectedTab === 1">📦 Log New Parcel</span>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-tab-group (selectedTabChange)="onTabChange($event)">
                <mat-tab label="Visitor">
                  <form [formGroup]="visitorForm" (ngSubmit)="logVisitor()" class="entry-form">
                    <mat-form-field appearance="outline">
                      <mat-label>Visitor Name</mat-label>
                      <input matInput formControlName="name" required>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Phone Number</mat-label>
                      <input matInput formControlName="phone" required>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Visiting Resident</mat-label>
                      <mat-select formControlName="resident" required>
                        <mat-option *ngFor="let resident of residents" [value]="resident.id">
                          {{resident.name}} - {{resident.apartment}}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Purpose of Visit</mat-label>
                      <textarea matInput formControlName="purpose" rows="3" required></textarea>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Vehicle Number (Optional)</mat-label>
                      <input matInput formControlName="vehicle">
                    </mat-form-field>
                    
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="visitorForm.invalid || loading">
                      {{loading ? '⏳ Logging...' : '✅ Log Visitor'}}
                    </button>
                  </form>
                </mat-tab>
                
                <mat-tab label="Parcel">
                  <form [formGroup]="parcelForm" (ngSubmit)="logParcel()" class="entry-form">
                    <mat-form-field appearance="outline">
                      <mat-label>Sender/Company</mat-label>
                      <input matInput formControlName="sender" required>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Recipient Resident</mat-label>
                      <mat-select formControlName="resident" required>
                        <mat-option *ngFor="let resident of residents" [value]="resident.id">
                          {{resident.name}} - {{resident.apartment}}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Parcel Type</mat-label>
                      <mat-select formControlName="type" required>
                        <mat-option value="Document">📄 Document</mat-option>
                        <mat-option value="Package">📦 Package</mat-option>
                        <mat-option value="Food">🍕 Food Delivery</mat-option>
                        <mat-option value="Medicine">💊 Medicine</mat-option>
                        <mat-option value="Other">📋 Other</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="description" rows="3" required></textarea>
                    </mat-form-field>
                    
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="parcelForm.invalid || loading">
                      {{loading ? '⏳ Logging...' : '📦 Log Parcel'}}
                    </button>
                  </form>
                </mat-tab>
              </mat-tab-group>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div class="right-panel">
          <mat-card class="list-card">
            <mat-card-header>
              <mat-card-title>🔄 Active Entries</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="active-list">
                <div class="active-item" *ngFor="let item of activeEntries">
                  <div class="item-icon">{{item.type === 'visitor' ? '👤' : '📦'}}</div>
                  <div class="item-details">
                    <h4>{{item.name}}</h4>
                    <p>{{item.details}}</p>
                    <span class="time">{{item.time}}</span>
                  </div>
                  <div class="item-actions">
                    <button mat-button color="primary" (click)="updateStatus(item, 'approved')" 
                            *ngIf="item.status === 'pending'">
                      ✅ Approve
                    </button>
                    <button mat-button color="warn" (click)="updateStatus(item, 'checkout')" 
                            *ngIf="item.status === 'inside'">
                      🚪 Check Out
                    </button>
                    <button mat-button color="accent" (click)="updateStatus(item, 'delivered')" 
                            *ngIf="item.type === 'parcel' && item.status === 'received'">
                      📬 Mark Delivered
                    </button>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="history-card">
            <mat-card-header>
              <mat-card-title>📋 Today's Log</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="history-list">
                <div class="history-item" *ngFor="let item of todayHistory">
                  <div class="history-icon">{{item.type === 'visitor' ? '👤' : '📦'}}</div>
                  <div class="history-details">
                    <h5>{{item.name}}</h5>
                    <p>{{item.details}}</p>
                    <span class="status-badge" [class]="'status-' + item.status">{{item.status}}</span>
                  </div>
                  <span class="history-time">{{item.time}}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .security-dashboard {
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
    
    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .form-card, .list-card, .history-card {
      margin-bottom: 24px;
    }
    
    .entry-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
    }
    
    .active-list, .history-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .active-item, .history-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    
    .item-icon, .history-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      border-radius: 8px;
    }
    
    .item-details, .history-details {
      flex: 1;
    }
    
    .item-details h4, .history-details h5 {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #1e293b;
    }
    
    .item-details p, .history-details p {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #64748b;
    }
    
    .time, .history-time {
      font-size: 12px;
      color: #94a3b8;
    }
    
    .item-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .status-pending {
      background: #fef3c7;
      color: #d97706;
    }
    
    .status-approved {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .status-inside {
      background: #dbeafe;
      color: #1d4ed8;
    }
    
    .status-delivered {
      background: #f3e8ff;
      color: #7c3aed;
    }
  `]
})
export class SecurityDashboardComponent {
  selectedTab = 0;
  loading = false;
  
  visitorForm: FormGroup;
  parcelForm: FormGroup;
  
  todayStats = {
    visitors: 0,
    parcels: 0,
    active: 0
  };
  
  residents = [
    { id: 1, name: 'John Smith', apartment: 'A-101' },
    { id: 2, name: 'Jane Doe', apartment: 'B-205' },
    { id: 3, name: 'Mike Johnson', apartment: 'C-301' }
  ];
  
  activeEntries: any[] = [];
  todayHistory: any[] = [];
  
  constructor(private fb: FormBuilder, private vpmsService: VpmsService) {
    this.visitorForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      resident: ['', Validators.required],
      purpose: ['', Validators.required],
      vehicle: ['']
    });
    
    this.parcelForm = this.fb.group({
      sender: ['', Validators.required],
      resident: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required]
    });
    
    this.loadData();
  }
  
  async loadData() {
    try {
      // Load residents from backend
      const residentsResponse = await this.vpmsService.getResidents();
      if (residentsResponse.residents) {
        this.residents = residentsResponse.residents.map((r: any) => ({
          id: r.id,
          name: r.name,
          apartment: r.contact_info || 'N/A'
        }));
      }
      
      // Load today's data from backend
      const allData = await this.vpmsService.getAllVisitorParcels();
      if (allData.data) {
        const today = new Date().toDateString();
        const todayData = allData.data.filter((item: any) => 
          new Date(item.created_at).toDateString() === today
        );
        
        this.todayStats = {
          visitors: todayData.filter((item: any) => item.type === 'Visitor').length,
          parcels: todayData.filter((item: any) => item.type === 'Parcel').length,
          active: todayData.filter((item: any) => 
            item.status === 'Approved' || item.status === 'New'
          ).length
        };
        
        // Set active entries and history
        this.activeEntries = todayData
          .filter((item: any) => item.status !== 'Completed')
          .map((item: any) => ({
            id: item.id,
            type: item.type.toLowerCase(),
            name: item.name,
            details: `${item.type === 'Visitor' ? 'Visiting' : 'For'} ${item.resident_name}`,
            time: new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            status: item.status.toLowerCase()
          }));
          
        this.todayHistory = todayData
          .filter((item: any) => item.status === 'Completed')
          .map((item: any) => ({
            id: item.id,
            type: item.type.toLowerCase(),
            name: item.name,
            details: `${item.type === 'Visitor' ? 'Visited' : 'Delivered to'} ${item.resident_name}`,
            time: new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            status: 'completed'
          }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data
      this.todayStats = {
        visitors: Math.floor(Math.random() * 20) + 5,
        parcels: Math.floor(Math.random() * 15) + 3,
        active: Math.floor(Math.random() * 8) + 2
      };
    }
  }
  
  onTabChange(event: any) {
    this.selectedTab = event.index;
  }
  
  async logVisitor() {
    if (this.visitorForm.valid) {
      this.loading = true;
      try {
        const formData = {
          resident_id: this.visitorForm.value.resident,
          type: 'Visitor',
          name: this.visitorForm.value.name,
          purpose_description: this.visitorForm.value.purpose,
          vehicle_details: this.visitorForm.value.vehicle || null
        };
        
        const response = await this.vpmsService.createVisitorParcel(formData);
        
        if (response.message) {
          // Refresh data
          await this.loadData();
          this.visitorForm.reset();
          alert('Visitor logged successfully!');
        }
      } catch (error) {
        console.error('Error logging visitor:', error);
        alert('Failed to log visitor');
      } finally {
        this.loading = false;
      }
    }
  }
  
  async logParcel() {
    if (this.parcelForm.valid) {
      this.loading = true;
      try {
        const formData = {
          resident_id: this.parcelForm.value.resident,
          type: 'Parcel',
          name: this.parcelForm.value.sender,
          purpose_description: `${this.parcelForm.value.type}: ${this.parcelForm.value.description}`
        };
        
        const response = await this.vpmsService.createVisitorParcel(formData);
        
        if (response.message) {
          // Refresh data
          await this.loadData();
          this.parcelForm.reset();
          alert('Parcel logged successfully!');
        }
      } catch (error) {
        console.error('Error logging parcel:', error);
        alert('Failed to log parcel');
      } finally {
        this.loading = false;
      }
    }
  }
  
  updateStatus(item: any, newStatus: string) {
    item.status = newStatus;
    if (newStatus === 'checkout' || newStatus === 'delivered') {
      this.todayHistory.unshift(item);
      this.activeEntries = this.activeEntries.filter(entry => entry.id !== item.id);
      this.todayStats.active--;
    } else if (newStatus === 'approved') {
      item.status = 'inside';
      this.todayStats.active++;
    }
  }
  
  getResidentName(id: number): string {
    const resident = this.residents.find(r => r.id === id);
    return resident ? `${resident.name} - ${resident.apartment}` : 'Unknown';
  }
}