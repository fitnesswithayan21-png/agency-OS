import { getLeadStageOptions, getLeadsQuery } from '@/app/dashboard/leads/queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { LeadStage } from '@/lib/types'

type SearchParams = {
  search?: string | string[]
  stage?: string | string[]
}

type LeadsPageProps = {
  searchParams?: Promise<SearchParams>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function formatStage(stage: LeadStage) {
  return stage
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getStageVariant(stage: LeadStage): 'default' | 'outline' | 'muted' {
  if (stage === 'won') return 'default'
  if (stage === 'lost') return 'muted'
  return 'outline'
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const search = getSingleValue(resolvedSearchParams.search)?.trim() ?? ''
  const selectedStage = getSingleValue(resolvedSearchParams.stage)
  const stageOptions = getLeadStageOptions()
  const stageFilter = stageOptions.includes(selectedStage as LeadStage)
    ? (selectedStage as LeadStage)
    : undefined

  const { leads, count } = await getLeadsQuery({
    search: search || undefined,
    stage: stageFilter,
  })

  const hasFilters = Boolean(search || stageFilter)

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Leads</h1>
          <p className='text-sm text-muted-foreground'>
            Review and triage incoming leads. Sorted by newest first.
          </p>
        </div>
        <Badge variant='outline'>{count ?? leads.length} total</Badge>
      </div>

      <Card>
        <CardHeader className='gap-3'>
          <CardTitle>Lead Directory</CardTitle>
          <form className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]'>
            <Input
              type='search'
              name='search'
              defaultValue={search}
              placeholder='Search name, email, or company'
              aria-label='Search leads'
            />
            <select
              name='stage'
              defaultValue={stageFilter ?? ''}
              aria-label='Filter by stage'
              className='flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1'
            >
              <option value=''>All stages</option>
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>
                  {formatStage(stage)}
                </option>
              ))}
            </select>
            <div className='flex gap-2'>
              <Button type='submit' className='flex-1 sm:flex-none'>
                Apply
              </Button>
              {hasFilters ? (
                <a
                  href='/dashboard/leads'
                  className='inline-flex h-9 flex-1 items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted sm:flex-none'
                >
                  Reset
                </a>
              ) : null}
            </div>
          </form>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className='flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center'>
              <p className='text-base font-medium'>No leads found.</p>
              <p className='mt-2 text-sm text-muted-foreground'>
                {hasFilters
                  ? 'Try adjusting the search or stage filter.'
                  : 'Leads will appear here once they are added.'}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='grid gap-3 md:hidden'>
                {leads.map((lead) => (
                  <div key={lead.id} className='rounded-lg border p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='truncate font-medium'>{lead.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {lead.company || 'No company'}
                        </p>
                      </div>
                      <Badge variant={getStageVariant(lead.stage)}>{formatStage(lead.stage)}</Badge>
                    </div>
                    <dl className='mt-4 space-y-2 text-sm'>
                      <div className='flex justify-between gap-3'>
                        <dt className='text-muted-foreground'>Email</dt>
                        <dd className='truncate text-right'>{lead.email || '—'}</dd>
                      </div>
                      <div className='flex justify-between gap-3'>
                        <dt className='text-muted-foreground'>Owner</dt>
                        <dd className='text-right'>{lead.owner?.full_name || 'Unassigned'}</dd>
                      </div>
                      <div className='flex justify-between gap-3'>
                        <dt className='text-muted-foreground'>Score</dt>
                        <dd className='text-right'>{lead.score}</dd>
                      </div>
                      <div className='flex justify-between gap-3'>
                        <dt className='text-muted-foreground'>Created</dt>
                        <dd className='text-right'>{formatDate(lead.created_at)}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>

              <div className='hidden overflow-x-auto md:block'>
                <table className='min-w-full text-sm'>
                  <thead className='border-b text-left text-muted-foreground'>
                    <tr>
                      <th className='py-3 pr-4 font-medium'>Lead</th>
                      <th className='py-3 pr-4 font-medium'>Email</th>
                      <th className='py-3 pr-4 font-medium'>Stage</th>
                      <th className='py-3 pr-4 font-medium'>Owner</th>
                      <th className='py-3 pr-4 font-medium'>Score</th>
                      <th className='py-3 font-medium'>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className='border-b last:border-b-0'>
                        <td className='py-4 pr-4'>
                          <div>
                            <p className='font-medium'>{lead.name}</p>
                            <p className='text-muted-foreground'>{lead.company || 'No company'}</p>
                          </div>
                        </td>
                        <td className='py-4 pr-4 text-muted-foreground'>{lead.email || '—'}</td>
                        <td className='py-4 pr-4'>
                          <Badge variant={getStageVariant(lead.stage)}>{formatStage(lead.stage)}</Badge>
                        </td>
                        <td className='py-4 pr-4 text-muted-foreground'>
                          {lead.owner?.full_name || 'Unassigned'}
                        </td>
                        <td className='py-4 pr-4'>{lead.score}</td>
                        <td className='py-4 text-muted-foreground'>{formatDate(lead.created_at)}</td>
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
