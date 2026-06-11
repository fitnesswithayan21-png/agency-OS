import Link from 'next/link'
import { signIn } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className='mb-3 text-sm text-destructive'>{error}</p>}
        {message && <p className='mb-3 text-sm text-muted-foreground'>{message}</p>}
        <form action={signIn} className='space-y-4'>
          <div className='space-y-1'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' name='email' type='email' required autoComplete='email' />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              name='password'
              type='password'
              required
              autoComplete='current-password'
            />
          </div>
          <Button type='submit' className='w-full'>
            Sign in
          </Button>
        </form>
        <div className='mt-4 flex justify-between text-sm text-muted-foreground'>
          <Link href='/forgot-password' className='hover:underline'>
            Forgot password?
          </Link>
          <Link href='/signup' className='hover:underline'>
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
