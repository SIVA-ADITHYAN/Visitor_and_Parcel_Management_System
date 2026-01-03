import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  visitors: {
    total_visitors: number;
    pending_visitors: number;
    active_visitors: number;
    completed_visitors: number;
    today_visitors: number;
  };
  parcels: {
    total_parcels: number;
    pending_parcels: number;
    acknowledged_parcels: number;
    collected_parcels: number;
    today_parcels: number;
  };
  users: {
    total_users: number;
    total_residents: number;
    total_guards: number;
    total_admins: number;
  };
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: Date;
}

export interface QuickActions {
  recentActivities: Activity[];
  pendingApprovals: Activity[];
  activeVisitors: Activity[];
}

export interface DailyStats {
  date: string;
  visitors: number;
  parcels: number;
}

export interface StatusStats {
  status: string;
  count: number;
}

export interface ResidentStats {
  resident_name: string;
  visitor_count: number;
  parcel_count: number;
}

export interface Reports {
  dailyStats: DailyStats[];
  statusStats: StatusStats[];
  residentStats: ResidentStats[];
}

export interface BulkUpdateRequest {
  ids: number[];
  status: string;
  notes?: string;
}

export interface ExportParams {
  period: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  constructor(private readonly http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
  }

  getQuickActions(): Observable<QuickActions> {
    return this.http.get<QuickActions>(`${this.baseUrl}/dashboard/quick-actions`);
  }

  getReports(period: string = 'week', type?: string): Observable<Reports> {
    let params = new HttpParams().set('period', period);
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<Reports>(`${this.baseUrl}/reports`, { params });
  }

  bulkStatusUpdate(request: BulkUpdateRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/bulk/status-update`, request);
  }

  exportData(exportParams: ExportParams): Observable<Blob> {
    let params = new HttpParams().set('period', exportParams.period);
    if (exportParams.type) {
      params = params.set('type', exportParams.type);
    }
    return this.http.get(`${this.baseUrl}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }
}