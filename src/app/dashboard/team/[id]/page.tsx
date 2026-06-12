import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTeamMemberQuery } from '@/app/dashboard/team/queries'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TeamMemberDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const member = await getTeamMemberQuery(resolvedParams.id)

  if (!member) {
    notFound()
  }

  // Fallback for if joined data is not available or empty
  const assignedProjects = Array.isArray(member.project_members) ? member.project_members : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/team">
            <Button variant="outline">Back to Team</Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{member.full_name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/team/${member.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div>{member.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Job Title</div>
              <div>{member.title || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Role</div>
              <div className="capitalize mt-1">
                <Badge variant="outline">{member.role}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="mt-1">
                {member.is_suspended ? (
                  <Badge variant="destructive">Suspended</Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Active</Badge>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Hourly Rate</div>
              <div>{member.hourly_rate != null ? `$${member.hourly_rate}/hr` : '-'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects assigned.</p>
            ) : (
              <div className="space-y-4">
                {assignedProjects.map((assignment: { project: { id: string, name: string, stage: string } | null, role_in_project: string }) => {
                  const p = assignment.project
                  if (!p) return null
                  return (
                    <div key={p.id} className="flex flex-col space-y-1 p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <Link href={`/dashboard/projects/${p.id}`} className="font-medium hover:underline">
                          {p.name}
                        </Link>
                        <Badge variant="muted">{assignment.role_in_project}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {p.stage.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
