import { getDb } from '@/lib/db'
import AdminsEditor from '@/components/admin/AdminsEditor'
import AdminShell from '@/components/admin/AdminShell'

export default function AdminsPage() {
  const db = getDb()
  const admins = (db.prepare('SELECT * FROM admins ORDER BY id').all() as {
    id: number; email: string; created_at: number
  }[]).map(r => ({ ...r }))

  return (
    <AdminShell
      title="Admin Access"
      subtitle="Only users listed here can receive a sign-in link."
      maxWidth={680}
    >
      <AdminsEditor initialAdmins={admins} />
    </AdminShell>
  )
}
