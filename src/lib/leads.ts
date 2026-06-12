import 'server-only'

import { requireStaff } from '@/lib/auth'
import type { Lead, LeadStage, Profile } from '@/lib/types'

export const LEAD_STAGES = [
  'new_lead',
  'contacted',
  'discovery_scheduled',
  'discovery_completed',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
] as const satisfies readonly LeadStage[]

export interface LeadOwnerSummary {
  id: Profile['id']
  full_name: Profile['full_name']
  email: Profile['email']
  role: Profile['role']
  avatar_url: Profile['avatar_url']
}

export interface LeadWithOwner extends Lead {
  owner: LeadOwnerSummary | null
}

export interface LeadListFilters {
  search?: string
  stage?: LeadStage | LeadStage[]
  ownerId?: string
  limit?: number
  offset?: number
}

export interface LeadInput {
  name: string
  company?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  industry?: string | null
  source?: string | null
  notes?: string | null
  stage?: LeadStage
  score?: number
  owner_id?: string | null
}

export type LeadUpdateInput = Partial<LeadInput>

export interface LeadListResult {
  leads: LeadWithOwner[]
  count: number | null
}

export interface LeadOwnerOption {
  id: Profile['id']
  full_name: Profile['full_name']
  email: Profile['email']
  role: Profile['role']
}

function normalizeNullableText(value: string | null | undefined) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeSearch(value: string) {
  return value.replace(/[%_,()\\]/g, '\\$&').trim()
}

function normalizeScore(score?: number) {
  if (score == null || Number.isNaN(score)) return 0
  return Math.min(100, Math.max(0, Math.trunc(score)))
}

function normalizeLeadInput(input: LeadInput) {
  const name = input.name.trim()
  if (!name) throw new Error('Lead name is required')

  return {
    name,
    company: normalizeNullableText(input.company),
    email: normalizeNullableText(input.email),
    phone: normalizeNullableText(input.phone),
    website: normalizeNullableText(input.website),
    industry: normalizeNullableText(input.industry),
    source: normalizeNullableText(input.source),
    notes: normalizeNullableText(input.notes),
    stage: input.stage ?? 'new_lead',
    score: normalizeScore(input.score),
    owner_id: input.owner_id ?? null,
  }
}

export async function listLeads(filters: LeadListFilters = {}): Promise<LeadListResult> {
  const { supabase } = await requireStaff()

  let query = supabase
    .from('leads')
    .select('*, owner:profiles(id, full_name, email, role, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.search?.trim()) {
    const pattern = `%${normalizeSearch(filters.search)}%`
    query = query.or(
      `name.ilike.${pattern},company.ilike.${pattern},email.ilike.${pattern}`
    )
  }

  if (filters.stage) {
    query = Array.isArray(filters.stage)
      ? query.in('stage', filters.stage)
      : query.eq('stage', filters.stage)
  }

  if (filters.ownerId) {
    query = query.eq('owner_id', filters.ownerId)
  }

  if (typeof filters.limit === 'number') {
    const offset = filters.offset ?? 0
    query = query.range(offset, offset + Math.max(0, filters.limit) - 1)
  }

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    leads: (data ?? []) as LeadWithOwner[],
    count,
  }
}

export async function getLead(id: string): Promise<LeadWithOwner | null> {
  const { supabase } = await requireStaff()
  const { data, error } = await supabase
    .from('leads')
    .select('*, owner:profiles(id, full_name, email, role, avatar_url)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as LeadWithOwner | null) ?? null
}

export async function listLeadOwners(): Promise<LeadOwnerOption[]> {
  const { supabase } = await requireStaff()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('role', ['owner', 'manager', 'member'])
    .eq('is_suspended', false)
    .order('full_name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as LeadOwnerOption[]
}

export async function createLead(input: LeadInput): Promise<LeadWithOwner> {
  const { supabase } = await requireStaff()
  const payload = normalizeLeadInput(input)

  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select('*, owner:profiles(id, full_name, email, role, avatar_url)')
    .single()

  if (error) throw new Error(error.message)
  return data as LeadWithOwner
}

export async function updateLead(id: string, input: LeadUpdateInput): Promise<LeadWithOwner> {
  const { supabase } = await requireStaff()
  const payload: Record<string, unknown> = {}

  if (input.name !== undefined) {
    const name = input.name.trim()
    if (!name) throw new Error('Lead name is required')
    payload.name = name
  }
  if (input.company !== undefined) payload.company = normalizeNullableText(input.company)
  if (input.email !== undefined) payload.email = normalizeNullableText(input.email)
  if (input.phone !== undefined) payload.phone = normalizeNullableText(input.phone)
  if (input.website !== undefined) payload.website = normalizeNullableText(input.website)
  if (input.industry !== undefined) payload.industry = normalizeNullableText(input.industry)
  if (input.source !== undefined) payload.source = normalizeNullableText(input.source)
  if (input.notes !== undefined) payload.notes = normalizeNullableText(input.notes)
  if (input.stage !== undefined) payload.stage = input.stage
  if (input.score !== undefined) payload.score = normalizeScore(input.score)
  if (input.owner_id !== undefined) payload.owner_id = input.owner_id

  if (Object.keys(payload).length === 0) {
    throw new Error('No lead fields provided')
  }

  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select('*, owner:profiles(id, full_name, email, role, avatar_url)')
    .single()

  if (error) throw new Error(error.message)
  return data as LeadWithOwner
}

export async function updateLeadStage(id: string, stage: LeadStage): Promise<LeadWithOwner> {
  return updateLead(id, { stage })
}

export async function updateLeadScore(id: string, score: number): Promise<LeadWithOwner> {
  return updateLead(id, { score })
}

export async function deleteLead(id: string): Promise<void> {
  const { supabase } = await requireStaff()
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
