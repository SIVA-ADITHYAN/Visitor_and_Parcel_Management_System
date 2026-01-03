import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VpmsService {
  private apiUrl = 'http://localhost:3003/api';

  constructor() {}

  // Visitor & Parcel Management
  async createVisitorParcel(data: any): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.apiUrl}/visitor-parcel/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getAllVisitorParcels(filters?: any): Promise<any> {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.apiUrl}/visitor-parcel/all?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }

  async getResidentVisitorParcels(residentId?: number, type?: string): Promise<any> {
    const token = localStorage.getItem('token');
    const url = residentId 
      ? `${this.apiUrl}/visitor-parcel/resident/${residentId}${type ? `?type=${type}` : ''}`
      : `${this.apiUrl}/visitor-parcel/resident${type ? `?type=${type}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }

  async getPendingApprovals(): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.apiUrl}/visitor-parcel/pending-approvals`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }

  async updateStatus(id: number, status: string, notes?: string): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.apiUrl}/visitor-parcel/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, notes })
    });
    return response.json();
  }

  async getResidents(): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.apiUrl}/auth/residents`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }

  // Helper methods
  getCurrentUser(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}