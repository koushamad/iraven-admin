import { getDb } from '@/lib/db'
import ContentEditor from '@/components/admin/ContentEditor'
import AdminShell from '@/components/admin/AdminShell'

export default function HeroPage() {
  const db = getDb()
  const rows = (db.prepare("SELECT * FROM site_content WHERE section IN ('hero','brand','legal','contact') ORDER BY section,sort_order,id").all() as {
    section: string; key: string; value: string; sort_order: number
  }[]).map(r => ({ ...r }))

  const bySection = rows.reduce<Record<string, typeof rows>>((acc, r) => {
    acc[r.section] = acc[r.section] ?? []
    acc[r.section].push(r)
    return acc
  }, {})

  return (
    <AdminShell
      title="Hero & Content"
      subtitle="Edit boot sequence, stats, labels, and brand text."
      maxWidth={820}
    >
      <ContentEditor initialRows={rows} sections={bySection} />
    </AdminShell>
  )
}
