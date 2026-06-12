import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTeamMemberQuery } from '@/app/dashboard/team/queries'
import { TeamForm } from '@/app/dashboard/team/team-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTeamMemberPage({ params }: PageProps) {
  const resolvedParams = await params
  const member = await getTeamMemberQuery(resolvedParams.id)

  if (!member) {
    notFound()
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Edit Team Member</h1>
          <p className='text-sm text-muted-foreground'>
            Update details for {member.full_name}.
          </p>
        </div>
        <Link
          href={`/dashboard/team/${member.id}`}
          className='inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted'
        >
          Back to profile
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamForm member={member} />
        </CardContent>
      </Card>
    </div>
  )
}
