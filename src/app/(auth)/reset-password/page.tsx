import { resetPassword } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className='mb-3 text-sm text-destructive'>{error}</p>}
        <form action={resetPassword} className='space-y-4'>
          <div className='space-y-1'>
            <Label htmlFor='password'>New password</Label>
            <Input id='password' name='password' type='password' required minLength={8} />
          </div>
          <Button type='submit' className='w-full'>
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
