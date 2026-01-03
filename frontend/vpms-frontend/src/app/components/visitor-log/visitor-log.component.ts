import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { VisitorParcelService } from '../../services/visitor-parcel.service';

@Component({
  selector: 'app-visitor-log',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Log New Visitor</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="visitorForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Resident</mat-label>
              <mat-select formControlName="resident_id" required>
                <mat-option *ngFor="let resident of residents" [value]="resident.id">
                  {{resident.name}} ({{resident.email}})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="visitorForm.get('resident_id')?.hasError('required')">
                Please select a resident
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Visitor Name</mat-label>
              <input matInput formControlName="name" required>
              <mat-error *ngIf="visitorForm.get('name')?.hasError('required')">
                Visitor name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Purpose of Visit</mat-label>
              <textarea matInput formControlName="purpose_description" rows="3" required></textarea>
              <mat-error *ngIf="visitorForm.get('purpose_description')?.hasError('required')">
                Purpose is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Vehicle Details (Optional)</mat-label>
              <input matInput formControlName="vehicle_details">
            </mat-form-field>

            <div class="file-input">
              <label for="media">Photo/ID Proof (Optional):</label>
              <input type="file" id="media" (change)="onFileSelected($event)" accept="image/*">
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes (Optional)</mat-label>
              <textarea matInput formControlName="notes" rows="2"></textarea>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="visitorForm.invalid || loading" class="full-width">
              {{ loading ? 'Logging Visitor...' : 'Log Visitor' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .file-input {
      margin-bottom: 16px;
    }
    .file-input label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
  `]
})
export class VisitorLogComponent implements OnInit {
  visitorForm: FormGroup;
  residents: any[] = [];
  selectedFile: File | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private visitorParcelService: VisitorParcelService,
    private snackBar: MatSnackBar
  ) {
    this.visitorForm = this.fb.group({
      resident_id: ['', Validators.required],
      name: ['', Validators.required],
      purpose_description: ['', Validators.required],
      vehicle_details: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadResidents();
  }

  loadResidents(): void {
    this.authService.getResidents().subscribe({
      next: (response) => {
        this.residents = response.residents;
      },
      error: (error) => {
        this.snackBar.open('Failed to load residents', 'Close', { duration: 3000 });
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.visitorForm.valid) {
      this.loading = true;
      const formData = new FormData();
      
      formData.append('type', 'Visitor');
      Object.keys(this.visitorForm.value).forEach(key => {
        if (this.visitorForm.value[key]) {
          formData.append(key, this.visitorForm.value[key]);
        }
      });
      
      if (this.selectedFile) {
        formData.append('media', this.selectedFile);
      }

      this.visitorParcelService.create(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Visitor logged successfully!', 'Close', { duration: 3000 });
          this.visitorForm.reset();
          this.selectedFile = null;
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.message || 'Failed to log visitor', 'Close', { duration: 3000 });
        }
      });
    }
  }
}