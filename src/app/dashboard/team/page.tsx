import Link from 'next/link'
import { getTeamQuery } from '@/app/dashboard/team/queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { UserRole } from '@/lib/types'

type SearchParams = {
  search?: string | string[]
  role?: string | string[]
  status?: string | string[]
}

type TeamPageProps = {
  searchParams?: Promise<SearchParams>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const search = getSingleValue(resolvedSearchParams.search)?.trim() ?? ''
  const role = getSingleValue(resolvedSearchParams.role) as UserRole | undefined
  const status = getSingleValue(resolvedSearchParams.status)
  
  let is_suspended: boolean | undefined = undefined
  if (status === 'active') is_suspended = false
  if (status === 'suspended') is_suspended = true

  const { members, count } = await getTeamQuery({
    search: search || undefined,
    role: role || undefined,
    is_suspended,
  })

  const hasFilters = Boolean(search || role || status)

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Team Directory</h1>
          <p className='text-sm text-muted-foreground'>
            View and manage your agency team members.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline'>{count ?? members.length} total</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className='gap-3'>
          <CardTitle>Team Members</CardTitle>
          <form className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]'>
            <Input
              type='search'
              name='search'
              defaultValue={search}
              placeholder='Search name or email...'
              aria-label='Search team'
            />
            <select
              name='role'
              defaultValue={role ?? ''}
              className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:w-[130px]'
              aria-label='Filter by role'
            >
              <option value=''>All Roles</option>
              <option value='owner'>Owner</option>
              <option value='manager'>Manager</option>
              <option value='member'>Member</option>
            </select>
            <select
              name='status'
              defaultValue={status ?? ''}
              className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:w-[130px]'
              aria-label='Filter by status'
            >
              <option value=''>All Statuses</option>
              <option value='active'>Active</option>
              <option value='suspended'>Suspended</option>
            </select>
            <div className='flex gap-2'>
              <Button type='submit' className='flex-1 sm:flex-none'>
                Apply
              </Button>
              {hasFilters ? (
                <Link
                  href='/dashboard/team'
                  className='inline-flex h-9 flex-1 items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted sm:flex-none'
                >
                  Reset
                </Link>
              ) : null}
            </div>
          </form>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className='flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center'>
              <p className='text-base font-medium'>No team members found.</p>
              <p className='mt-2 text-sm text-muted-foreground'>
                {hasFilters ? 'Try adjusting your filters.' : ''}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='grid gap-3 md:hidden'>
                {members.map((member) => (
                  <div key={member.id} className='rounded-lg border p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <Link href={`/dashboard/team/${member.id}`} className='truncate font-medium hover:underline'>{member.full_name}</Link>
                        <p className='text-sm text-muted-foreground'>
                          {member.title || 'No title'}
                        </p>
                      </div>
                      <Badge variant={member.is_suspended ? 'destructive' : 'muted'}>
                        {member.is_suspended ? 'Suspended' : member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className='hidden overflow-x-auto md:block'>
                <table className='min-w-full text-sm'>
                  <thead className='border-b text-left text-muted-foreground'>
                    <tr>
                      <th className='py-3 pr-4 font-medium'>Name</th>
                      <th className='py-3 pr-4 font-medium'>Email</th>
                      <th className='py-3 pr-4 font-medium'>Role</th>
                      <th className='py-3 font-medium'>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className='border-b last:border-b-0 hover:bg-muted/50'>
                        <td className='py-4 pr-4'>
                          <div>
                            <Link href={`/dashboard/team/${member.id}`} className='font-medium hover:underline'>
                              {member.full_name}
                            </Link>
                            <p className='text-muted-foreground'>{member.title || 'No title'}</p>
                          </div>
                        </td>
                        <td className='py-4 pr-4 text-muted-foreground'>
                          {member.email}
                        </td>
                        <td className='py-4 pr-4 text-muted-foreground capitalize'>
                          {member.role}
                        </td>
                        <td className='py-4'>
                          {member.is_suspended ? (
                            <Badge variant="destructive">Suspended</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Active</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
