import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { VisitorParcelService, VisitorParcel } from '../../services/visitor-parcel.service';

@Component({
  selector: 'app-resident-parcel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <h2>My Parcels</h2>
      
      <div *ngIf="parcels.length === 0" class="no-data">
        No parcels found
      </div>
      
      <mat-card *ngFor="let parcel of parcels" class="parcel-card">
        <mat-card-header>
          <mat-card-title>{{parcel.name}}</mat-card-title>
          <mat-card-subtitle>
            <mat-chip [color]="getStatusColor(parcel.status)">{{parcel.status}}</mat-chip>
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Description:</strong> {{parcel.purpose_description}}</p>
          <p><strong>Received by:</strong> {{parcel.security_guard_name}}</p>
          <p><strong>Date:</strong> {{parcel.created_at | date:'medium'}}</p>
          <p *ngIf="parcel.notes"><strong>Notes:</strong> {{parcel.notes}}</p>
          <div *ngIf="parcel.media" class="media-section">
            <img [src]="'http://localhost:3001/' + parcel.media" alt="Parcel photo" class="parcel-image">
          </div>
        </mat-card-content>
        <mat-card-actions *ngIf="parcel.status === 'Received'">
          <button mat-raised-button color="primary" 
                  (click)="acknowledgeParcel(parcel.id!)">
            Acknowledge Receipt
          </button>
        </mat-card-actions>
        <mat-card-actions *ngIf="parcel.status === 'Acknowledged'">
          <button mat-raised-button color="accent" 
                  (click)="markAsCollected(parcel.id!)">
            Mark as Collected
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }
    .parcel-card {
      margin-bottom: 16px;
    }
    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .media-section {
      margin-top: 16px;
    }
    .parcel-image {
      max-width: 200px;
      max-height: 200px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    mat-card-actions {
      gap: 8px;
    }
  `]
})
export class ResidentParcelComponent implements OnInit {
  parcels: VisitorParcel[] = [];

  constructor(
    private visitorParcelService: VisitorParcelService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadParcels();
  }

  loadParcels(): void {
    this.visitorParcelService.getByResident(undefined, 'Parcel').subscribe({
      next: (response) => {
        this.parcels = response.data;
      },
      error: (error) => {
        this.snackBar.open('Failed to load parcels', 'Close', { duration: 3000 });
      }
    });
  }

  acknowledgeParcel(id: number): void {
    this.visitorParcelService.updateStatus(id, 'Acknowledged').subscribe({
      next: (response) => {
        this.snackBar.open('Parcel acknowledged successfully', 'Close', { duration: 3000 });
        this.loadParcels();
      },
      error: (error) => {
        this.snackBar.open('Failed to acknowledge parcel', 'Close', { duration: 3000 });
      }
    });
  }

  markAsCollected(id: number): void {
    this.visitorParcelService.updateStatus(id, 'Collected').subscribe({
      next: (response) => {
        this.snackBar.open('Parcel marked as collected', 'Close', { duration: 3000 });
        this.loadParcels();
      },
      error: (error) => {
        this.snackBar.open('Failed to update parcel status', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Received':
        return 'warn';
      case 'Acknowledged':
        return 'primary';
      case 'Collected':
        return 'accent';
      default:
        return '';
    }
  }
}