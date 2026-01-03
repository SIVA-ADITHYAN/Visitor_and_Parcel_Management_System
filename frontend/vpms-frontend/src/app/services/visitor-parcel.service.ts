import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VisitorParcel {
  id?: number;
  resident_id: number;
  security_guard_id?: number;
  type: 'Visitor' | 'Parcel';
  name: string;
  purpose_description: string;
  media?: string;
  vehicle_details?: string;
  status: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  resident_name?: string;
  security_guard_name?: string;
}

export interface VisitorParcelResponse {
  message: string;
  data: VisitorParcel;
}

export interface VisitorParcelListResponse {
  data: VisitorParcel[];
  total?: number;
}

export interface StatusUpdateRequest {
  status: string;
  notes?: string;
}

export interface VisitorParcelFilters {
  type?: 'Visitor' | 'Parcel';
  status?: string;
  resident_id?: number;
  date_from?: string;
  date_to?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VisitorParcelService {
  private readonly apiUrl = `${environment.apiUrl}/visitor-parcel`;

  constructor(private readonly http: HttpClient) {}

  create(data: FormData): Observable<VisitorParcelResponse> {
    return this.http.post<VisitorParcelResponse>(this.apiUrl, data)
      .pipe(
        catchError(error => {
          console.error('Error creating visitor/parcel:', error);
          return throwError(() => error);
        })
      );
  }

  getByResident(residentId?: number, type?: 'Visitor' | 'Parcel'): Observable<VisitorParcelListResponse> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    
    const url = residentId ? `${this.apiUrl}/resident/${residentId}` : `${this.apiUrl}/resident`;
    
    return this.http.get<VisitorParcelListResponse>(url, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching resident data:', error);
          return throwError(() => error);
        })
      );
  }

  getPendingApprovals(): Observable<VisitorParcelListResponse> {
    return this.http.get<VisitorParcelListResponse>(`${this.apiUrl}/resident/pending`)
      .pipe(
        catchError(error => {
          console.error('Error fetching pending approvals:', error);
          return throwError(() => error);
        })
      );
  }

  updateStatus(id: number, request: StatusUpdateRequest): Observable<VisitorParcelResponse> {
    return this.http.put<VisitorParcelResponse>(`${this.apiUrl}/${id}/status`, request)
      .pipe(
        catchError(error => {
          console.error('Error updating status:', error);
          return throwError(() => error);
        })
      );
  }

  getAll(filters?: VisitorParcelFilters): Observable<VisitorParcelListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    
    return this.http.get<VisitorParcelListResponse>(this.apiUrl, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching all data:', error);
          return throwError(() => error);
        })
      );
  }

  getById(id: number): Observable<VisitorParcelResponse> {
    return this.http.get<VisitorParcelResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching by ID:', error);
          return throwError(() => error);
        })
      );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting:', error);
          return throwError(() => error);
        })
      );
  }
}