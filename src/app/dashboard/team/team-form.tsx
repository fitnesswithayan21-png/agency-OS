'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  updateTeamMemberAction,
  type TeamFormState,
} from '@/app/dashboard/team/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserRole } from '@/lib/types'

type TeamFormProps = {
  member: {
    id: string
    full_name: string
    title: string | null
    role: UserRole
    hourly_rate: number | null
    is_suspended: boolean
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' disabled={pending} className='w-full sm:w-auto'>
      {pending ? 'Updating...' : 'Update team member'}
    </Button>
  )
}

export function TeamForm({ member }: TeamFormProps) {
  const initialState: TeamFormState = {
    errors: {},
  }

  const [state, formAction] = useActionState(updateTeamMemberAction, initialState)

  return (
    <form action={formAction} className='space-y-6'>
      <input type="hidden" name="id" value={member.id} />
      {state.message && <p className='text-sm text-destructive'>{state.message}</p>}

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-1'>
          <Label htmlFor='full_name'>Full Name</Label>
          <Input id='full_name' name='full_name' required defaultValue={member.full_name} />
          {state.errors.full_name && <p className='text-sm text-destructive'>{state.errors.full_name}</p>}
        </div>

        <div className='space-y-1'>
          <Label htmlFor='title'>Job Title</Label>
          <Input id='title' name='title' defaultValue={member.title || ''} />
        </div>

        <div className='space-y-1'>
          <Label htmlFor='role'>Role</Label>
          <select
            id='role'
            name='role'
            defaultValue={member.role}
            className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
          >
            <option value='owner'>Owner</option>
            <option value='manager'>Manager</option>
            <option value='member'>Member</option>
          </select>
        </div>

        <div className='space-y-1'>
          <Label htmlFor='hourly_rate'>Hourly Rate</Label>
          <Input id='hourly_rate' name='hourly_rate' type='number' step='0.01' defaultValue={member.hourly_rate?.toString() || ''} />
        </div>

        <div className='space-y-1 sm:col-span-2 flex items-center gap-3'>
          <input type="checkbox" id='is_suspended' name='is_suspended' defaultChecked={member.is_suspended} className="h-4 w-4" />
          <div>
            <Label htmlFor='is_suspended'>Account Suspended</Label>
            <p className='text-sm text-muted-foreground'>Suspended users cannot log in to the dashboard.</p>
          </div>
        </div>
      </div>

      <div className='flex justify-end'>
        <SubmitButton />
      </div>
    </form>
  )
}
