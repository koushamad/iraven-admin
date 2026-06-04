const VAULT_ADDR  = process.env.VAULT_ADDR  ?? 'http://127.0.0.1:8200'
const VAULT_TOKEN = process.env.VAULT_TOKEN ?? ''

export async function vaultGet(path: string): Promise<Record<string, string>> {
  // path like "kv/k3s-ha01/iraven/admin/argocd" → API path "kv/data/k3s-ha01/iraven/admin/argocd"
  const apiPath = path.replace(/^kv\//, 'kv/data/')
  const res = await fetch(`${VAULT_ADDR}/v1/${apiPath}`, {
    headers: { 'X-Vault-Token': VAULT_TOKEN },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Vault GET ${path} → ${res.status}`)
  const json = await res.json() as { data: { data: Record<string, string> } }
  return json.data.data
}

export async function getArgoEventsWebhookUrl(): Promise<string> {
  try {
    const s = await vaultGet('kv/k3s-ha01/iraven/admin/argo-events')
    return s.webhook_url
  } catch {
    return process.env.ARGO_EVENTS_WEBHOOK_URL ?? 'http://localhost:12000/workspace/provision'
  }
}

export async function getArgoCdCredentials(): Promise<{ url: string; username: string; password: string }> {
  const s = await vaultGet('kv/k3s-ha01/iraven/admin/argocd')
  return { url: s.url, username: s.username, password: s.password }
}

export async function getArgoWorkflowsCredentials(): Promise<{ base_url: string; token: string }> {
  const s = await vaultGet('kv/k3s-ha01/iraven/admin/argo-workflows')
  return { base_url: s.base_url, token: s.token }
}
