import Link from 'next/link'
import { signUp } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className='mb-3 text-sm text-destructive'>{error}</p>}
        <form action={signUp} className='space-y-4'>
          <div className='space-y-1'>
            <Label htmlFor='full_name'>Full name</Label>
            <Input id='full_name' name='full_name' required />
          </div>
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
              minLength={8}
              autoComplete='new-password'
            />
          </div>
          <Button type='submit' className='w-full'>
            Sign up
          </Button>
        </form>
        <p className='mt-4 text-center text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link href='/login' className='hover:underline'>
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
