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
  selector: 'app-parcel-log',
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
          <mat-card-title>Log New Parcel</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="parcelForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Resident</mat-label>
              <mat-select formControlName="resident_id" required>
                <mat-option *ngFor="let resident of residents" [value]="resident.id">
                  {{resident.name}} ({{resident.email}})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="parcelForm.get('resident_id')?.hasError('required')">
                Please select a resident
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Sender/Company Name</mat-label>
              <input matInput formControlName="name" required>
              <mat-error *ngIf="parcelForm.get('name')?.hasError('required')">
                Sender name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Parcel Description</mat-label>
              <textarea matInput formControlName="purpose_description" rows="3" required></textarea>
              <mat-error *ngIf="parcelForm.get('purpose_description')?.hasError('required')">
                Description is required
              </mat-error>
            </mat-form-field>

            <div class="file-input">
              <label for="media">Parcel Photo (Optional):</label>
              <input type="file" id="media" (change)="onFileSelected($event)" accept="image/*">
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes (Optional)</mat-label>
              <textarea matInput formControlName="notes" rows="2"></textarea>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="parcelForm.invalid || loading" class="full-width">
              {{ loading ? 'Logging Parcel...' : 'Log Parcel' }}
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
export class ParcelLogComponent implements OnInit {
  parcelForm: FormGroup;
  residents: any[] = [];
  selectedFile: File | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private visitorParcelService: VisitorParcelService,
    private snackBar: MatSnackBar
  ) {
    this.parcelForm = this.fb.group({
      resident_id: ['', Validators.required],
      name: ['', Validators.required],
      purpose_description: ['', Validators.required],
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
    if (this.parcelForm.valid) {
      this.loading = true;
      const formData = new FormData();
      
      formData.append('type', 'Parcel');
      Object.keys(this.parcelForm.value).forEach(key => {
        if (this.parcelForm.value[key]) {
          formData.append(key, this.parcelForm.value[key]);
        }
      });
      
      if (this.selectedFile) {
        formData.append('media', this.selectedFile);
      }

      this.visitorParcelService.create(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Parcel logged successfully!', 'Close', { duration: 3000 });
          this.parcelForm.reset();
          this.selectedFile = null;
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.message || 'Failed to log parcel', 'Close', { duration: 3000 });
        }
      });
    }
  }
}