import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import FounderForm from '@/components/admin/FounderForm'
import AdminShell from '@/components/admin/AdminShell'

export default async function EditFounderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  const founder = db.prepare('SELECT * FROM founders WHERE id=?').get(id) as Record<string, unknown> | undefined
  if (!founder) notFound()
  const traits = (db.prepare('SELECT trait FROM founder_traits WHERE founder_id=? ORDER BY sort_order').all(id) as { trait: string }[]).map(t => t.trait)

  return (
    <AdminShell
      title={`Edit: ${founder.name as string}`}
      subtitle="Update founder profile, quote, and traits."
      backHref="/admin/founders"
      backLabel="Founders"
      maxWidth={860}
    >
      <FounderForm initial={{ ...founder, traits } as Parameters<typeof FounderForm>[0]['initial']} />
    </AdminShell>
  )
}
