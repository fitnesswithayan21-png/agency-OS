export type UserRole = 'owner' | 'manager' | 'member' | 'client'
export type LeadStage =
  | 'new_lead'
  | 'contacted'
  | 'discovery_scheduled'
  | 'discovery_completed'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost'
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
export type ContractStatus = 'draft' | 'pending' | 'signed' | 'expired'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue'
export type ProjectStage = 'planning' | 'in_progress' | 'review' | 'client_approval' | 'completed'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type DeliverableStatus = 'pending' | 'submitted' | 'approved' | 'rejected'
export type FileFolder = 'contracts' | 'invoices' | 'deliverables' | 'assets' | 'client_files'
export type ActivityType =
  | 'meeting'
  | 'email'
  | 'call'
  | 'note'
  | 'proposal'
  | 'payment'
  | 'deliverable'
  | 'status_change'
export type ConversationType = 'internal' | 'client'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  title: string | null
  avatar_url: string | null
  hourly_rate: number | null
  is_suspended: boolean
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  website: string | null
  industry: string | null
  source: string | null
  notes: string | null
  stage: LeadStage
  score: number
  owner_id: string | null
  converted_client_id: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  website: string | null
  industry: string | null
  address: string | null
  notes: string | null
  lead_id: string | null
  portal_user_id: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  client_id: string | null
  lead_id: string | null
  type: ActivityType
  title: string
  description: string | null
  actor_id: string | null
  occurred_at: string
}

export interface Proposal {
  id: string
  client_id: string | null
  lead_id: string | null
  title: string
  scope: string | null
  deliverables: string | null
  timeline: string | null
  terms: string | null
  amount: number
  status: ProposalStatus
  sent_at: string | null
  viewed_at: string | null
  decided_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProposalItem {
  id: string
  proposal_id: string
  description: string
  qty: number
  unit_price: number
}

export interface Contract {
  id: string
  client_id: string
  proposal_id: string | null
  title: string
  body: string
  status: ContractStatus
  version: number
  signed_at: string | null
  signed_by_name: string | null
  signature_data: string | null
  signer_ip: string | null
  expires_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string | null
  contract_id: string | null
  name: string
  description: string | null
  stage: ProjectStage
  budget: number | null
  deadline: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  project_id: string
  title: string
  due_date: string | null
  amount: number
  is_completed: boolean
  completed_at: string | null
}

export interface Task {
  id: string
  project_id: string
  milestone_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface Deliverable {
  id: string
  project_id: string
  milestone_id: string | null
  title: string
  file_id: string | null
  status: DeliverableStatus
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export interface Invoice {
  id: string
  number: string
  client_id: string
  project_id: string | null
  status: InvoiceStatus
  issue_date: string
  due_date: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  amount_paid: number
  is_recurring: boolean
  recurring_interval: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  qty: number
  unit_price: number
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  paid_at: string
  method: string | null
  reference: string | null
}

export interface TimeEntry {
  id: string
  profile_id: string
  project_id: string | null
  task_id: string | null
  started_at: string
  duration_minutes: number
  notes: string | null
}

export interface Conversation {
  id: string
  type: ConversationType
  title: string
  project_id: string | null
  client_id: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
}

export interface Notification {
  id: string
  profile_id: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export interface FileRecord {
  id: string
  name: string
  folder: FileFolder
  storage_path: string
  mime_type: string | null
  size_bytes: number | null
  project_id: string | null
  client_id: string | null
  uploaded_by: string | null
  created_at: string
}

export interface AutomationRule {
  id: string
  key: string
  name: string
  is_enabled: boolean
}

export interface ProjectMember {
  project_id: string
  profile_id: string
  role_in_project: string
}
