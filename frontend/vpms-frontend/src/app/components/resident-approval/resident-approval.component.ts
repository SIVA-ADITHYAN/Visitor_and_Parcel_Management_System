import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { VisitorParcelService, VisitorParcel } from '../../services/visitor-parcel.service';

@Component({
  selector: 'app-resident-approval',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="container">
      <h2>Visitor Management</h2>
      
      <mat-tab-group>
        <mat-tab label="Pending Approvals">
          <div class="tab-content">
            <div *ngIf="pendingVisitors.length === 0" class="no-data">
              No pending visitor approvals
            </div>
            
            <mat-card *ngFor="let visitor of pendingVisitors" class="visitor-card">
              <mat-card-header>
                <mat-card-title>{{visitor.name}}</mat-card-title>
                <mat-card-subtitle>
                  <mat-chip [color]="getStatusColor(visitor.status)">{{visitor.status}}</mat-chip>
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p><strong>Purpose:</strong> {{visitor.purpose_description}}</p>
                <p *ngIf="visitor.vehicle_details"><strong>Vehicle:</strong> {{visitor.vehicle_details}}</p>
                <p><strong>Logged by:</strong> {{visitor.security_guard_name}}</p>
                <p><strong>Time:</strong> {{visitor.created_at | date:'medium'}}</p>
                <p *ngIf="visitor.notes"><strong>Notes:</strong> {{visitor.notes}}</p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" 
                        (click)="updateVisitorStatus(visitor.id!, 'Approved')">
                  Approve
                </button>
                <button mat-raised-button color="warn" 
                        (click)="updateVisitorStatus(visitor.id!, 'Rejected')">
                  Reject
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>
        
        <mat-tab label="All Visitors">
          <div class="tab-content">
            <div *ngIf="allVisitors.length === 0" class="no-data">
              No visitor records found
            </div>
            
            <mat-card *ngFor="let visitor of allVisitors" class="visitor-card">
              <mat-card-header>
                <mat-card-title>{{visitor.name}}</mat-card-title>
                <mat-card-subtitle>
                  <mat-chip [color]="getStatusColor(visitor.status)">{{visitor.status}}</mat-chip>
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p><strong>Purpose:</strong> {{visitor.purpose_description}}</p>
                <p *ngIf="visitor.vehicle_details"><strong>Vehicle:</strong> {{visitor.vehicle_details}}</p>
                <p><strong>Logged by:</strong> {{visitor.security_guard_name}}</p>
                <p><strong>Time:</strong> {{visitor.created_at | date:'medium'}}</p>
                <p *ngIf="visitor.notes"><strong>Notes:</strong> {{visitor.notes}}</p>
              </mat-card-content>
              <mat-card-actions *ngIf="visitor.status === 'Approved'">
                <button mat-raised-button color="accent" 
                        (click)="updateVisitorStatus(visitor.id!, 'Entered')">
                  Mark as Entered
                </button>
              </mat-card-actions>
              <mat-card-actions *ngIf="visitor.status === 'Entered'">
                <button mat-raised-button color="accent" 
                        (click)="updateVisitorStatus(visitor.id!, 'Exited')">
                  Mark as Exited
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }
    .tab-content {
      padding: 20px 0;
    }
    .visitor-card {
      margin-bottom: 16px;
    }
    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    mat-card-actions {
      gap: 8px;
    }
  `]
})
export class ResidentApprovalComponent implements OnInit {
  pendingVisitors: VisitorParcel[] = [];
  allVisitors: VisitorParcel[] = [];

  constructor(
    private visitorParcelService: VisitorParcelService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPendingApprovals();
    this.loadAllVisitors();
  }

  loadPendingApprovals(): void {
    this.visitorParcelService.getPendingApprovals().subscribe({
      next: (response) => {
        this.pendingVisitors = response.data;
      },
      error: (error) => {
        this.snackBar.open('Failed to load pending approvals', 'Close', { duration: 3000 });
      }
    });
  }

  loadAllVisitors(): void {
    this.visitorParcelService.getByResident(undefined, 'Visitor').subscribe({
      next: (response) => {
        this.allVisitors = response.data;
      },
      error: (error) => {
        this.snackBar.open('Failed to load visitors', 'Close', { duration: 3000 });
      }
    });
  }

  updateVisitorStatus(id: number, status: string): void {
    this.visitorParcelService.updateStatus(id, status).subscribe({
      next: (response) => {
        this.snackBar.open(`Visitor status updated to ${status}`, 'Close', { duration: 3000 });
        this.loadPendingApprovals();
        this.loadAllVisitors();
      },
      error: (error) => {
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'New':
      case 'Waiting for Approval':
        return 'warn';
      case 'Approved':
      case 'Entered':
        return 'primary';
      case 'Exited':
        return 'accent';
      default:
        return '';
    }
  }
}