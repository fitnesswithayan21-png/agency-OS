'use client'

import { assignToProjectAction, removeFromProjectAction } from '@/app/dashboard/team/actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { ProjectMemberWithProfile } from '@/lib/team'

interface AssignMemberFormProps {
  projectId: string
  availableProfiles: { id: string, full_name: string, role: string }[]
  assignedProfiles: ProjectMemberWithProfile[]
}

export function AssignMemberForm({ projectId, availableProfiles, assignedProfiles }: AssignMemberFormProps) {
  const unassignedProfiles = availableProfiles.filter(
    (p) => !assignedProfiles.find((ap) => ap.profile_id === p.id || (ap.profile && ap.profile.id === p.id))
  )

  return (
    <div className="space-y-6">
      {assignedProfiles.length > 0 ? (
        <ul className="space-y-3">
          {assignedProfiles.map((ap) => {
            const p = ap.profile
            if (!p) return null
            return (
              <li key={p.id} className="flex items-center justify-between border p-3 rounded-md">
                <div>
                  <p className="font-medium">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{ap.role_in_project}</p>
                </div>
                <form action={removeFromProjectAction.bind(null, projectId, p.id)}>
                  <Button variant="destructive" size="sm">Remove</Button>
                </form>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No team members assigned.</p>
      )}

      {unassignedProfiles.length > 0 && (
        <form 
          className="flex flex-col gap-3 pt-4 border-t"
          action={async (formData) => {
            const profileId = formData.get('profile_id') as string
            const roleInProject = formData.get('role_in_project') as string
            if (profileId && roleInProject) {
              await assignToProjectAction(projectId, profileId, roleInProject)
            }
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="profile_id">Assign New Member</Label>
            <div className="flex gap-2">
              <select
                id="profile_id"
                name="profile_id"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a member...</option>
                {unassignedProfiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                ))}
              </select>
              <select
                name="role_in_project"
                required
                className="flex h-9 w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="contributor">Contributor</option>
                <option value="lead">Lead</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button type="submit">Assign</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
