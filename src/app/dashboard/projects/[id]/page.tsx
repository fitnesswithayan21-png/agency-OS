import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectQuery } from '@/app/dashboard/projects/queries'
import { getProjectMembersQuery, getTeamQuery } from '@/app/dashboard/team/queries'
import { AssignMemberForm } from './assign-member-form'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  params: Promise<{ id: string }>
}

function formatStage(stage: string) {
  return stage
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const [project, projectMembers, { members: allTeamMembers }] = await Promise.all([
    getProjectQuery(resolvedParams.id),
    getProjectMembersQuery(resolvedParams.id),
    getTeamQuery({ is_suspended: false, limit: 1000 }),
  ])

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="mt-1">
                <Badge>{formatStage(project.stage)}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Description</div>
              <div className="whitespace-pre-wrap">{project.description || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Budget</div>
              <div>{project.budget != null ? `$${project.budget.toLocaleString()}` : '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Due Date</div>
              <div>
                {project.deadline
                  ? new Date(project.deadline).toLocaleDateString()
                  : '-'}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent>
              {project.client ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                    <div>
                      <Link href={`/dashboard/clients/${project.client.id}`} className="hover:underline font-medium">
                        {project.client.name}
                      </Link>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Company</div>
                    <div>{project.client.company || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Contact</div>
                    <div>{project.client.email || '-'}<br />{project.client.phone || ''}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No client attached to this project.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignMemberForm 
                projectId={project.id} 
                assignedProfiles={projectMembers || []}
                availableProfiles={allTeamMembers}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
