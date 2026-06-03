import { getDb } from '@/lib/db'
import EngineEditor from '@/components/admin/EngineEditor'
import AdminShell from '@/components/admin/AdminShell'

export default function EnginePage() {
  const db = getDb()
  const systems = db.prepare('SELECT * FROM engine_systems ORDER BY sort_order,id').all().map((r: Record<string, unknown>) => ({ ...r }))
  const capabilities = db.prepare('SELECT * FROM engine_capabilities ORDER BY sort_order,id').all().map((r: Record<string, unknown>) => ({ ...r }))
  const contentRows = db.prepare("SELECT * FROM site_content WHERE section='engine' ORDER BY sort_order").all().map((r: Record<string, unknown>) => ({ ...r }))

  return (
    <AdminShell
      title="Engine"
      subtitle="Edit engine systems, capabilities, and section copy."
      maxWidth={820}
    >
      <EngineEditor
        initialSystems={systems as Parameters<typeof EngineEditor>[0]['initialSystems']}
        initialCapabilities={capabilities as Parameters<typeof EngineEditor>[0]['initialCapabilities']}
        contentRows={contentRows as Parameters<typeof EngineEditor>[0]['contentRows']}
      />
    </AdminShell>
  )
}
