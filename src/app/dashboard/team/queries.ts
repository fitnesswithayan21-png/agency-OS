import 'server-only'

import {
  getTeamMember,
  listTeam,
  getProjectMembers,
  type TeamListFilters,
} from '@/lib/team'

export async function getTeamQuery(filters: TeamListFilters = {}) {
  return listTeam(filters)
}

export async function getTeamMemberQuery(id: string) {
  return getTeamMember(id)
}

export async function getProjectMembersQuery(projectId: string) {
  return getProjectMembers(projectId)
}
