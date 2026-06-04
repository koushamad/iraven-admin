export { getWebDb as getDb } from './web-db'
export { getAdminDb } from './admin-db'
export { getWorkspaceDb } from './workspace-db'

export type Product = {
  id: number; key: string; name: string; initial: string; orbit: number
  category: string; domain: string; href: string; accent: 'cyan' | 'violet' | 'gold'
  story: string; visual_label: string; favicon: string | null
  float_stat_k: string | null; float_stat_v: string | null; compliance: string | null
  sort_order: number; active: number
}

export type Founder = {
  id: number; name: string; role: string | null; quote: string | null
  href: string | null; favicon: string | null; sort_order: number; active: number
}
