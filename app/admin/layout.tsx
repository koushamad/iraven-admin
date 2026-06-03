import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <AdminSidebar email={session.email} />
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  )
}
