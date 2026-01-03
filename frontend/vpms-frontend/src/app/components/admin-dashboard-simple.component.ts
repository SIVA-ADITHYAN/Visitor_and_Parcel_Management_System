import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <div class="header-content">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <button class="refresh-btn" (click)="loadDashboardData()">
          🔄 Refresh Data
        </button>
      </div>
      
      <div class="stats-container">
        <div class="stat-card visitors">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{stats.totalVisitors}}</h3>
            <p>Total Visitors</p>
            <span class="trend up">↗️ +12% from last week</span>
          </div>
        </div>
        
        <div class="stat-card parcels">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <h3>{{stats.totalParcels}}</h3>
            <p>Total Parcels</p>
            <span class="trend up">↗️ +8% from last week</span>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <h3>{{stats.pendingApprovals}}</h3>
            <p>Pending Approvals</p>
            <span class="trend down">↘️ -3% from last week</span>
          </div>
        </div>
        
        <div class="stat-card active">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <h3>{{stats.activeVisitors}}</h3>
            <p>Active Now</p>
            <span class="trend neutral">→ Same as yesterday</span>
          </div>
        </div>
      </div>
      
      <div class="content-grid">
        <div class="activity-panel">
          <div class="panel-header">
            <h2>🔥 Live Activity Feed</h2>
            <div class="live-indicator">🟢 Live</div>
          </div>
          <div class="activity-stream">
            <div class="activity-item" *ngFor="let activity of recentActivities; let i = index" [style.animation-delay]="i * 0.1 + 's'">
              <div class="activity-avatar">{{getActivityIcon(activity.type)}}</div>
              <div class="activity-details">
                <p class="activity-text">{{activity.message}}</p>
                <span class="activity-timestamp">{{activity.time}}</span>
              </div>
              <div class="activity-badge" [class]="'badge-' + activity.status">{{activity.status}}</div>
            </div>
          </div>
        </div>
        
        <div class="charts-panel">
          <div class="chart-header">
            <h2>📊 Weekly Analytics</h2>
            <select class="time-filter">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div class="chart-area">
            <div class="chart-bars">
              <div class="bar-group" *ngFor="let day of weeklyData">
                <div class="bar visitors" [style.height]="day.visitors + '%'"></div>
                <div class="bar parcels" [style.height]="day.parcels + '%'"></div>
                <span class="bar-label">{{day.day}}</span>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color visitors"></span>
                <span>Visitors</span>
              </div>
              <div class="legend-item">
                <span class="legend-color parcels"></span>
                <span>Parcels</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="system-panel">
          <div class="panel-header">
            <h2>⚡ System Health</h2>
            <div class="health-score">98%</div>
          </div>
          <div class="system-metrics">
            <div class="metric-row">
              <div class="metric-label">
                <span class="status-dot green"></span>
                Database
              </div>
              <div class="metric-value">Online</div>
            </div>
            <div class="metric-row">
              <div class="metric-label">
                <span class="status-dot green"></span>
                API Server
              </div>
              <div class="metric-value">Healthy</div>
            </div>
            <div class="metric-row">
              <div class="metric-label">
                <span class="status-dot yellow"></span>
                Storage
              </div>
              <div class="metric-value">78% Used</div>
            </div>
            <div class="metric-row">
              <div class="metric-label">
                <span class="status-dot green"></span>
                Security
              </div>
              <div class="metric-value">Active</div>
            </div>
          </div>
        </div>
        
        <div class="quick-actions">
          <h2>🚀 Quick Actions</h2>
          <div class="action-buttons">
            <button class="action-btn primary">
              <span>👤</span>
              Add User
            </button>
            <button class="action-btn secondary">
              <span>📋</span>
              View Reports
            </button>
            <button class="action-btn tertiary">
              <span>⚙️</span>
              Settings
            </button>
            <button class="action-btn danger">
              <span>🔒</span>
              Security
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px;
      color: white;
    }
    
    .dashboard-header h1 {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }
    
    .dashboard-header p {
      margin: 0;
      opacity: 0.9;
    }
    
    .refresh-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .refresh-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
    }
    
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      background: white;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }
    
    .stat-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    
    .stat-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
    }
    
    .stat-info h3 {
      font-size: 36px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #1e293b;
    }
    
    .stat-info p {
      font-size: 16px;
      color: #64748b;
      margin: 0 0 12px 0;
    }
    
    .trend {
      font-size: 14px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
    }
    
    .trend.up {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .trend.down {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .trend.neutral {
      background: #f1f5f9;
      color: #64748b;
    }
    
    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }
    
    .activity-panel, .charts-panel, .system-panel, .quick-actions {
      background: white;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .panel-header h2 {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      color: #1e293b;
    }
    
    .live-indicator {
      background: #dcfce7;
      color: #16a34a;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .activity-stream {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #f1f5f9;
      animation: slideIn 0.5s ease forwards;
      opacity: 0;
      transform: translateX(-20px);
    }
    
    @keyframes slideIn {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .activity-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .activity-details {
      flex: 1;
    }
    
    .activity-text {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #1e293b;
    }
    
    .activity-timestamp {
      font-size: 12px;
      color: #64748b;
    }
    
    .activity-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .badge-active {
      background: #dbeafe;
      color: #1d4ed8;
    }
    
    .badge-completed {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .badge-approved {
      background: #f3e8ff;
      color: #7c3aed;
    }
    
    .chart-area {
      height: 200px;
      position: relative;
    }
    
    .chart-bars {
      display: flex;
      align-items: end;
      gap: 12px;
      height: 160px;
      margin-bottom: 20px;
    }
    
    .bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex: 1;
    }
    
    .bar {
      width: 100%;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s ease;
    }
    
    .bar.visitors {
      background: linear-gradient(180deg, #667eea, #764ba2);
    }
    
    .bar.parcels {
      background: linear-gradient(180deg, #16a34a, #15803d);
    }
    
    .bar-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
    
    .chart-legend {
      display: flex;
      gap: 24px;
      justify-content: center;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
    
    .legend-color.visitors {
      background: #667eea;
    }
    
    .legend-color.parcels {
      background: #16a34a;
    }
    
    .system-metrics {
      display: grid;
      gap: 16px;
    }
    
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
    }
    
    .metric-label {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .status-dot.green {
      background: #16a34a;
    }
    
    .status-dot.yellow {
      background: #d97706;
    }
    
    .health-score {
      background: #dcfce7;
      color: #16a34a;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 18px;
    }
    
    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .action-btn.primary {
      background: #667eea;
      color: white;
    }
    
    .action-btn.secondary {
      background: #f1f5f9;
      color: #475569;
    }
    
    .action-btn.tertiary {
      background: #fef3c7;
      color: #d97706;
    }
    
    .action-btn.danger {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
  `]
})
export class AdminDashboardComponent {
  stats = {
    totalVisitors: 0,
    totalParcels: 0,
    pendingApprovals: 0,
    activeVisitors: 0
  };
  
  recentActivities: any[] = [];
  weeklyData: any[] = [];
  
  constructor() {
    this.loadDashboardData();
  }
  
  loadDashboardData() {
    // Simulate API call
    setTimeout(() => {
      this.stats = {
        totalVisitors: Math.floor(Math.random() * 200) + 50,
        totalParcels: Math.floor(Math.random() * 100) + 20,
        pendingApprovals: Math.floor(Math.random() * 15) + 1,
        activeVisitors: Math.floor(Math.random() * 10) + 1
      };
      
      this.recentActivities = [
        {
          type: 'visitor',
          message: 'New visitor John Doe checked in at Gate A',
          time: '2 minutes ago',
          status: 'active'
        },
        {
          type: 'parcel',
          message: 'Amazon package delivered to Apartment 301',
          time: '15 minutes ago',
          status: 'completed'
        },
        {
          type: 'approval',
          message: 'Visitor request approved by Jane Smith',
          time: '1 hour ago',
          status: 'approved'
        },
        {
          type: 'visitor',
          message: 'Guest visitor checked out from Building B',
          time: '2 hours ago',
          status: 'completed'
        }
      ];
      
      this.weeklyData = [
        { day: 'Mon', visitors: 60, parcels: 40 },
        { day: 'Tue', visitors: 80, parcels: 55 },
        { day: 'Wed', visitors: 45, parcels: 30 },
        { day: 'Thu', visitors: 90, parcels: 70 },
        { day: 'Fri', visitors: 70, parcels: 50 },
        { day: 'Sat', visitors: 30, parcels: 20 },
        { day: 'Sun', visitors: 20, parcels: 15 }
      ];
    }, 500);
  }
  
  getActivityIcon(type: string): string {
    switch(type) {
      case 'visitor': return '👥';
      case 'parcel': return '📦';
      case 'approval': return '✅';
      default: return '📋';
    }
  }
}