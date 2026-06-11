import { forgotPassword } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className='mb-3 text-sm text-destructive'>{error}</p>}
        {message && <p className='mb-3 text-sm text-muted-foreground'>{message}</p>}
        <form action={forgotPassword} className='space-y-4'>
          <div className='space-y-1'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' name='email' type='email' required />
          </div>
          <Button type='submit' className='w-full'>
            Send reset link
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
