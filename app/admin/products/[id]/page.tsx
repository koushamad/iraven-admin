import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import ProductForm from '@/components/admin/ProductForm'
import AdminShell from '@/components/admin/AdminShell'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(id) as Record<string, unknown> | undefined
  if (!product) notFound()

  const points = (db.prepare('SELECT text FROM product_points WHERE product_id=? ORDER BY sort_order').all(id) as { text: string }[]).map(p => p.text)

  return (
    <AdminShell
      title={`Edit: ${product.name as string}`}
      subtitle="Update product details, links, and content."
      backHref="/admin/products"
      backLabel="Products"
      maxWidth={860}
    >
      <ProductForm initial={{ ...product, points } as Parameters<typeof ProductForm>[0]['initial']} />
    </AdminShell>
  )
}
