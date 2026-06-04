import { getWorkspaceDb } from '@/lib/db'
import { getArgoWorkflowsCredentials } from '@/lib/vault'
import AdminShell from '@/components/admin/AdminShell'

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Succeeded: '#2ee8c4', completed: '#2ee8c4',
    Running: '#4be1ec', provisioning: '#4be1ec',
    Failed: '#ff6b6b', Error: '#ff6b6b',
    Pending: '#f5c842', not_started: '#5a6080',
  }
  const c = colors[status] || '#5a6080'
  const isRunning = status === 'Running' || status === 'provisioning'
  return (
    <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: c + '18', border: `1px solid ${c}40`, color: c, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {isRunning && <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, flexShrink: 0 }} />}
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function relativeTime(ts: string | number | null) {
  if (!ts) return '—'
  const sec = typeof ts === 'string' ? Math.floor(new Date(ts).getTime() / 1000) : ts
  const diff = Math.floor(Date.now() / 1000) - sec
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(sec * 1000).toLocaleDateString()
}

type ArgoWorkflow = {
  metadata: { name: string; creationTimestamp: string }
  spec:     { arguments?: { parameters?: { name: string; value: string }[] } }
  status:   { phase: string; startedAt?: string; finishedAt?: string; message?: string }
}

type Playground = {
  slug: string; display_name: string; owner_email: string
  provisioning_status: string; created_at: number
}

export default async function ProvisioningPage() {
  const db = getWorkspaceDb()
  const playgrounds = db.prepare(`
    SELECT slug, display_name, owner_email, provisioning_status, created_at
    FROM playgrounds ORDER BY created_at DESC
  `).all() as Playground[]

  // Fetch live workflow runs from k3s-master via Argo Workflows API
  let argoWorkflows: ArgoWorkflow[] = []
  let argoError: string | null = null
  try {
    const { base_url, token } = await getArgoWorkflowsCredentials()
    const res = await fetch(
      `${base_url}/api/v1/workflows/argo?labelSelector=workflows.argoproj.io/workflow-template=workspace-provision&limit=50`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    )
    if (res.ok) {
      const data = await res.json() as { items: ArgoWorkflow[] | null }
      argoWorkflows = data.items ?? []
    } else {
      argoError = `Argo API: ${res.status}`
    }
  } catch (e) {
    argoError = String(e)
  }

  // Build slug → workflow map
  const workflowBySlug: Record<string, ArgoWorkflow> = {}
  for (const wf of argoWorkflows) {
    const slugParam = wf.spec.arguments?.parameters?.find(p => p.name === 'slug')?.value
    if (slugParam) workflowBySlug[slugParam] = wf
  }

  return (
    <AdminShell title="Provisioning" subtitle="Live workspace provision status from k3s-master." maxWidth={1000}>

      {argoError && (
        <div style={{ background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.18)', borderRadius: 10, padding: '10px 16px', marginBottom: 18, fontSize: 12.5, color: '#ff8b8b', fontFamily: 'var(--font-display)' }}>
          Argo Workflows unreachable — showing DB state only. ({argoError})
        </div>
      )}

      <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Playground', 'Owner', 'DB Status', 'Workflow', 'Workflow Status', 'Started', 'Finished'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#333849', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {playgrounds.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px 14px', textAlign: 'center', color: '#333849', fontFamily: 'var(--font-display)', fontSize: 13 }}>No playgrounds yet.</td></tr>
            )}
            {playgrounds.map((p, i) => {
              const wf = workflowBySlug[p.slug]
              return (
                <tr key={p.slug} style={{ borderBottom: i < playgrounds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 13, color: '#d0d4e8', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{p.display_name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#5a6080', marginTop: 2 }}>{p.slug}</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#7a8098', fontFamily: 'var(--font-display)' }}>{p.owner_email}</td>
                  <td style={{ padding: '10px 14px' }}><Badge status={p.provisioning_status} /></td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11.5, color: '#a9aec5' }}>
                    {wf ? wf.metadata.name : <span style={{ color: '#333849' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {wf ? <Badge status={wf.status.phase} /> : <span style={{ fontSize: 12, color: '#333849', fontFamily: 'var(--font-display)' }}>not triggered</span>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#5a6080', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
                    {wf?.status.startedAt ? relativeTime(wf.status.startedAt) : relativeTime(p.created_at)}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#5a6080', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
                    {wf?.status.finishedAt ? relativeTime(wf.status.finishedAt) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {argoWorkflows.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 11.5, color: '#333849', fontFamily: 'var(--font-display)' }}>
          {argoWorkflows.length} workflow run{argoWorkflows.length !== 1 ? 's' : ''} loaded from k3s-master
        </div>
      )}
    </AdminShell>
  )
}
