'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  updateTeamMember,
  assignToProject,
  removeFromProject,
  type TeamUpdateInput,
} from '@/lib/team'
import type { UserRole } from '@/lib/types'

const TEAM_PATH = '/dashboard/team'

export interface TeamFormState {
  errors: Record<string, string>
  message?: string
}

function revalidateTeamPaths(profileId?: string) {
  revalidatePath(TEAM_PATH)
  if (profileId) {
    revalidatePath(`${TEAM_PATH}/${profileId}`)
  }
}

export async function updateTeamMemberAction(
  _prevState: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  const id = String(formData.get('id') || '')
  if (!id) return { errors: {}, message: 'Missing profile ID' }

  const full_name = String(formData.get('full_name') || '').trim()
  const title = String(formData.get('title') || '').trim()
  const role = String(formData.get('role') || '') as UserRole
  const hourly_rate_str = String(formData.get('hourly_rate') || '')
  const hourly_rate = hourly_rate_str ? parseFloat(hourly_rate_str) : null
  const is_suspended = formData.get('is_suspended') === 'on'

  const errors: Record<string, string> = {}
  if (!full_name) errors.full_name = 'Full name is required.'

  if (Object.keys(errors).length > 0) {
    return { errors, message: 'Please correct the highlighted fields.' }
  }

  try {
    const input: TeamUpdateInput = {
      full_name,
      title: title || null,
      role: role || 'member',
      hourly_rate,
      is_suspended,
    }

    await updateTeamMember(id, input)
    revalidateTeamPaths(id)
  } catch (error) {
    return {
      errors: {},
      message: error instanceof Error ? error.message : 'Unable to update team member.',
    }
  }

  redirect(`${TEAM_PATH}/${id}`)
}

export async function assignToProjectAction(projectId: string, profileId: string, roleInProject: string) {
  await assignToProject(projectId, profileId, roleInProject)
  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath(`/dashboard/team/${profileId}`)
}

export async function removeFromProjectAction(projectId: string, profileId: string) {
  await removeFromProject(projectId, profileId)
  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath(`/dashboard/team/${profileId}`)
}
