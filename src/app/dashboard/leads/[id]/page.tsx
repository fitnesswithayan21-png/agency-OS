import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLead } from '@/lib/leads'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const lead = await getLead(resolvedParams.id)

  if (!lead) {
    notFound()
  }

  const formatStage = (stage: string) => {
    return stage
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/leads">
            <Button variant="outline">Back to Leads</Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
          <Badge variant="muted">{formatStage(lead.stage)}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/leads/${lead.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div>{lead.email || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Phone</div>
              <div>{lead.phone || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Company</div>
              <div>{lead.company || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Source</div>
              <div>{lead.source || '-'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Owner</div>
              <div>{lead.owner?.full_name || 'Unassigned'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Notes</div>
              <div className="whitespace-pre-wrap">{lead.notes || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Created Date</div>
              <div>{new Date(lead.created_at).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Updated Date</div>
              <div>{new Date(lead.updated_at).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
