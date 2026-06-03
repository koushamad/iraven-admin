import { getDb } from './index'

const db = getDb()

// ── Products ──────────────────────────────────────────────────────────────────
const products = [
  {
    key: 'zenory', name: 'Zenory', initial: 'Z', orbit: 1,
    category: 'Wellness', domain: 'zenory.fit', href: 'https://zenory.fit',
    accent: 'cyan',
    story: 'A calm, premium wellbeing app — meditation, sleep stories, music, and daily routines guided by senseis. Designed to lower the temperature of a busy life.',
    visual_label: 'Zenory app — wellbeing UI',
    favicon: 'https://zenory.fit/favicon-32x32.png',
    float_stat_k: 'Tonight', float_stat_v: 'Sleep · 22 min',
    compliance: null, sort_order: 1,
    points: [
      'Guided meditation & sensei-led sessions',
      'Sleep stories & calming soundscapes',
      'Daily routines that build gentle habits',
    ],
  },
  {
    key: 'socc360', name: 'Socc360', initial: 'S', orbit: 2,
    category: 'Football intelligence', domain: 'socc360.com', href: 'https://socc360.com',
    accent: 'cyan',
    story: 'A live football intelligence companion — scores, fixtures, leagues, teams, players, news, and live activities on iOS. Editorial-grade, matchday-fast.',
    visual_label: 'Socc360 — live match screen',
    favicon: 'https://socc360.com/brand/socc360-icon-180.png',
    float_stat_k: 'Live now', float_stat_v: '2 — 1 · 78\'',
    compliance: null, sort_order: 2,
    points: [
      'Live scores & real-time match events',
      'Fixtures, leagues, teams & players',
      'iOS Live Activities for matchday',
    ],
  },
  {
    key: 'chancegoal', name: 'ChanceGoal', initial: 'C', orbit: 3,
    category: 'Simulated engagement', domain: 'chancegoal.com', href: 'https://chancegoal.com',
    accent: 'violet',
    story: 'Football engagement built on simulated predictions. Players compete using virtual credits in a safe, data-rich experience — pure fun, no stakes.',
    visual_label: 'ChanceGoal — prediction UI',
    favicon: 'https://chancegoal.com/favicon.svg',
    float_stat_k: 'Balance', float_stat_v: '2,400 credits',
    compliance: 'Simulated predictions only. Virtual credits have no monetary value — no real money, deposits, withdrawals, cash prizes, or redeemable value.',
    sort_order: 3,
    points: [
      'Simulated predictions on real fixtures',
      'Virtual credits & friendly competition',
      'Designed safe & compliant · 18+',
    ],
  },
  {
    key: 'media', name: 'IRaven Media', initial: 'M', orbit: 4,
    category: 'Growth automation', domain: 'media.iraven.io', href: 'https://media.iraven.io',
    accent: 'violet',
    story: 'An approval-first media & growth operating system — publishing, automation, content workflows, and campaign operations in one control center.',
    visual_label: 'IRaven Media — control center',
    favicon: '/iraven-logo.svg',
    float_stat_k: 'Queue', float_stat_v: '12 awaiting approval',
    compliance: null, sort_order: 4,
    points: [
      'Approval-first publishing pipelines',
      'Workflow & campaign automation',
      'One control center for growth ops',
    ],
  },
]

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (key,name,initial,orbit,category,domain,href,accent,story,visual_label,favicon,float_stat_k,float_stat_v,compliance,sort_order)
  VALUES (@key,@name,@initial,@orbit,@category,@domain,@href,@accent,@story,@visual_label,@favicon,@float_stat_k,@float_stat_v,@compliance,@sort_order)
`)
const insertPoint = db.prepare(`
  INSERT OR IGNORE INTO product_points (product_id,text,sort_order) VALUES (?,?,?)
`)
const getProductId = db.prepare(`SELECT id FROM products WHERE key=?`)

for (const p of products) {
  const { points, ...row } = p
  insertProduct.run(row)
  const product = getProductId.get(p.key) as { id: number }
  points.forEach((text, i) => insertPoint.run(product.id, text, i))
}

// ── IRaven Media sub-projects ─────────────────────────────────────────────────
const mediaId = (getProductId.get('media') as { id: number }).id
const insertSub = db.prepare(`
  INSERT OR IGNORE INTO sub_projects (product_id,name,description,href,favicon,sort_order)
  VALUES (?,?,?,?,?,?)
`)
// placeholder — admin can add more
insertSub.run(mediaId, 'IRaven Media Platform', 'Main media & growth automation control center', 'https://media.iraven.io', '/iraven-logo.svg', 1)

// ── Founders ──────────────────────────────────────────────────────────────────
const insertFounder = db.prepare(`
  INSERT OR IGNORE INTO founders (name,role,quote,href,favicon,signal,signal_color,sort_order)
  VALUES (@name,@role,@quote,@href,@favicon,@signal,@signal_color,@sort_order)
`)
const insertTrait = db.prepare(`
  INSERT OR IGNORE INTO founder_traits (founder_id,trait,sort_order) VALUES (?,?,?)
`)
insertFounder.run({
  name: 'Kousha Ghodsizad',
  role: 'Co-founder & Technical Founder',
  quote: 'IRaven is built by a small founding team turning complex business ideas into intelligent digital systems — with focus, speed, and product-level craft.\n\nOur products are not the boundary of what we build. They are proof of how we think, design, automate, and ship AI-native systems for different markets.',
  href: 'https://kousha.dev',
  favicon: 'https://kousha.dev/assets/favicon.png',
  signal: 'active',
  signal_color: 'gold',
  sort_order: 1,
})
const founder = db.prepare('SELECT id FROM founders WHERE name=?').get('Kousha Ghodsizad') as { id: number }
const traits = ['Product engineering', 'Architecture', 'Automation', 'AI systems', 'Startup execution']
traits.forEach((trait, i) => insertTrait.run(founder.id, trait, i))

// ── Engine systems ────────────────────────────────────────────────────────────
const insertSystem = db.prepare(`
  INSERT OR IGNORE INTO engine_systems (number,heading,description,sort_order)
  VALUES (@number,@heading,@description,@sort_order)
`)
const insertCapability = db.prepare(`INSERT OR IGNORE INTO engine_capabilities (capability,sort_order) VALUES (?,?)`)

const systems = [
  { number: '01', heading: 'AI workflows', description: 'Model-driven pipelines for content, recommendations & product intelligence.' },
  { number: '02', heading: 'Real-time APIs', description: 'Low-latency delivery for live sports, activities & synchronized state.' },
  { number: '03', heading: 'Mobile-first design', description: 'Built for the smallest screen first, scaled up with intent.' },
  { number: '04', heading: 'Observability', description: 'Tracing, metrics & alerting — issues caught before users feel them.' },
  { number: '05', heading: 'Automation', description: 'Approval-first operations that remove manual, repetitive work.' },
  { number: '06', heading: 'Scalable infrastructure', description: 'Cloud-native services that grow without re-architecture.' },
  { number: '07', heading: 'Secure architecture', description: 'Privacy-respecting, defensively designed product foundations.' },
]
systems.forEach((s, i) => insertSystem.run({ ...s, sort_order: i + 1 }))
const capabilities = ['AI product design', 'Real-time data', 'Mobile apps', 'Media automation', 'Sports platforms', 'Wellness tech', 'Cloud-native']
capabilities.forEach((c, i) => insertCapability.run(c, i + 1))

// ── Site content (hero, nav, contact, etc.) ───────────────────────────────────
const upsertContent = db.prepare(`
  INSERT INTO site_content (section,key,value,sort_order) VALUES (@section,@key,@value,@sort_order)
  ON CONFLICT(section,key) DO UPDATE SET value=excluded.value
`)
const content = [
  // Hero boot sequence
  { section: 'hero', key: 'boot_0', value: 'RavenOS // igniting core…', sort_order: 0 },
  { section: 'hero', key: 'boot_1', value: 'RavenOS // linking product orbits…', sort_order: 1 },
  { section: 'hero', key: 'boot_2', value: 'RavenOS // 4 systems online · founder signal locked', sort_order: 2 },
  { section: 'hero', key: 'boot_3', value: 'RavenOS // status: nominal', sort_order: 3 },
  // Hero stats
  { section: 'hero', key: 'stat_0_v', value: '4', sort_order: 10 },
  { section: 'hero', key: 'stat_0_k', value: 'live products', sort_order: 10 },
  { section: 'hero', key: 'stat_1_v', value: '1', sort_order: 11 },
  { section: 'hero', key: 'stat_1_k', value: 'shared engine', sort_order: 11 },
  { section: 'hero', key: 'stat_2_v', value: 'AI', sort_order: 12 },
  { section: 'hero', key: 'stat_2_k', value: 'native by design', sort_order: 12 },
  // Founder signal node label
  { section: 'hero', key: 'founder_node_label', value: 'Founder signal', sort_order: 20 },
  // Engine section
  { section: 'engine', key: 'eyebrow', value: 'The shared engine', sort_order: 0 },
  { section: 'engine', key: 'title', value: 'One mission-control engine behind every orbit.', sort_order: 1 },
  { section: 'engine', key: 'lede', value: 'Readable for anyone, credible for engineers. The same foundation powers all four products — and everything IRaven builds next.', sort_order: 2 },
  // Contact
  { section: 'contact', key: 'email', value: 'kousha@iraven.io', sort_order: 0 },
  // Nav / footer brand
  { section: 'brand', key: 'name', value: 'IRaven', sort_order: 0 },
  { section: 'brand', key: 'tagline', value: 'An AI-native product studio building a connected constellation of products across wellness, football intelligence, simulated sports engagement, and media automation.', sort_order: 1 },
  // Footer legal
  { section: 'legal', key: 'chancegoal', value: 'ChanceGoal offers simulated predictions with virtual credits only. No real money, deposits, withdrawals, cash prizes, or redeemable value.', sort_order: 0 },
]
for (const c of content) upsertContent.run(c)

// ── Admins ────────────────────────────────────────────────────────────────────
db.prepare('INSERT OR IGNORE INTO admins (email) VALUES (?)').run('kousha@iraven.io')

console.log('Database seeded successfully.')
