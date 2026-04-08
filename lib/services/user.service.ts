import { getProvider } from '@/lib/data-provider'
import type { Database } from '@/lib/database.types'
import type { AuthUser } from '@/lib/data-provider'

type UserRow = Database['public']['Tables']['users']['Row']

export interface TeamMember {
  id: string
  name: string
  role: UserRow['role']
  titlesAssigned: number
  titlesCompleted: number
  titlesInProgress: number
  avgTimePerTitle: string
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return getProvider().auth.getCurrentUser()
}

export async function getUsers(): Promise<UserRow[]> {
  return getProvider().users.getAll()
}

export async function getAnalysts(): Promise<UserRow[]> {
  return getProvider().users.getAnalysts()
}

export async function getTeamMembers(period: string = 'week'): Promise<TeamMember[]> {
  return getProvider().users.getTeamMembers(period)
}
