import Link from 'next/link'

export default function NotFound() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center'>
      <h1 className='text-6xl font-bold tracking-tight'>404</h1>
      <p className='text-sm text-muted-foreground'>This page does not exist.</p>
      <Link
        href='/'
        className='inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
      >
        Back to home
      </Link>
    </main>
  )
}
