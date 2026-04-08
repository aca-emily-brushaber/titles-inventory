import { getProvider } from '@/lib/data-provider'

export interface DashboardKPI {
  label: string
  value: number | string
  icon: string
  trend: string
  trendDirection: 'up' | 'down'
}

export interface RiskDistribution {
  high: number
  medium: number
  low: number
}

export interface ActivityFeedItem {
  id: string
  analyst: string
  action: string
  recordId: string
  timestamp: string
}

export interface VolumeDataPoint {
  date: string
  received: number
  completed: number
}

export async function getKPIs(): Promise<DashboardKPI[]> {
  return getProvider().dashboard.getKPIs()
}

export async function getRiskDistribution(): Promise<RiskDistribution> {
  return getProvider().dashboard.getRiskDistribution()
}

export async function getVolumeData(): Promise<VolumeDataPoint[]> {
  return getProvider().dashboard.getVolumeData()
}

export async function getActivityFeed(): Promise<ActivityFeedItem[]> {
  return getProvider().dashboard.getActivityFeed()
}

export async function logActivity(
  analystId: string,
  analystName: string,
  action: string,
  recordId?: string
): Promise<void> {
  return getProvider().dashboard.logActivity(analystId, analystName, action, recordId)
}
