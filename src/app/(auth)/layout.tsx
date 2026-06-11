export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='flex min-h-screen items-center justify-center bg-muted/40 p-4'>
      <div className='w-full max-w-sm'>
        <h1 className='mb-6 text-center text-2xl font-bold tracking-tight'>AgencyOS</h1>
        {children}
      </div>
    </main>
  )
}
