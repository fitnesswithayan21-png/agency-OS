import 'server-only'

import { requireStaff } from '@/lib/auth'
import type { Profile, UserRole } from '@/lib/types'

export interface ProjectMemberWithProfile {
  profile_id: string
  role_in_project: string
  profile: Pick<Profile, 'id' | 'full_name' | 'email' | 'role' | 'avatar_url' | 'title'> | null
}

export interface TeamListFilters {
  search?: string
  role?: UserRole | UserRole[]
  is_suspended?: boolean
  limit?: number
  offset?: number
}

export interface TeamListResult {
  members: Profile[]
  count: number | null
}

function normalizeSearch(value: string) {
  return value.replace(/[%_,()\\]/g, '\\$&').trim()
}

export async function listTeam(filters: TeamListFilters = {}): Promise<TeamListResult> {
  const { supabase } = await requireStaff()

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .in('role', ['owner', 'manager', 'member'])
    .order('full_name', { ascending: true })

  if (filters.search?.trim()) {
    const pattern = `%${normalizeSearch(filters.search)}%`
    query = query.or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
  }

  if (filters.role) {
    query = Array.isArray(filters.role)
      ? query.in('role', filters.role)
      : query.eq('role', filters.role)
  }

  if (filters.is_suspended !== undefined) {
    query = query.eq('is_suspended', filters.is_suspended)
  }

  if (typeof filters.limit === 'number') {
    const offset = filters.offset ?? 0
    query = query.range(offset, offset + Math.max(0, filters.limit) - 1)
  }

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    members: data as Profile[],
    count,
  }
}

export async function getTeamMember(id: string) {
  const { supabase } = await requireStaff()
  const { data, error } = await supabase
    .from('profiles')
    .select('*, project_members(role_in_project, project:projects(*))')
    .eq('id', id)
    .in('role', ['owner', 'manager', 'member'])
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export type TeamUpdateInput = {
  full_name?: string
  role?: UserRole
  title?: string | null
  hourly_rate?: number | null
  is_suspended?: boolean
}

export async function updateTeamMember(id: string, input: TeamUpdateInput): Promise<Profile> {
  const { supabase } = await requireStaff()
  const payload: Record<string, unknown> = {}

  if (input.full_name !== undefined) {
    const name = input.full_name.trim()
    if (!name) throw new Error('Full name is required')
    payload.full_name = name
  }
  if (input.role !== undefined) payload.role = input.role
  if (input.title !== undefined) payload.title = input.title ? input.title.trim() : null
  if (input.hourly_rate !== undefined) payload.hourly_rate = input.hourly_rate
  if (input.is_suspended !== undefined) payload.is_suspended = input.is_suspended

  if (Object.keys(payload).length === 0) {
    throw new Error('No fields provided for update')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as Profile
}

export async function assignToProject(projectId: string, profileId: string, roleInProject: string = 'contributor'): Promise<void> {
  const { supabase } = await requireStaff()
  const { error } = await supabase
    .from('project_members')
    .upsert({
      project_id: projectId,
      profile_id: profileId,
      role_in_project: roleInProject,
    }, { onConflict: 'project_id,profile_id' })
    
  if (error) throw new Error(error.message)
}

export async function removeFromProject(projectId: string, profileId: string): Promise<void> {
  const { supabase } = await requireStaff()
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('profile_id', profileId)

  if (error) throw new Error(error.message)
}

export async function getProjectMembers(projectId: string) {
  const { supabase } = await requireStaff()
  const { data, error } = await supabase
    .from('project_members')
    .select('profile_id, role_in_project, profile:profiles(id, full_name, email, role, avatar_url, title)')
    .eq('project_id', projectId)

  if (error) throw new Error(error.message)
  return data as unknown as ProjectMemberWithProfile[]
}
