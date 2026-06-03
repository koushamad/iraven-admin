import ProductForm from '@/components/admin/ProductForm'
import AdminShell from '@/components/admin/AdminShell'

export default function NewProductPage() {
  return (
    <AdminShell
      title="New Product"
      subtitle="Add a new product to the constellation."
      backHref="/admin/products"
      backLabel="Products"
      maxWidth={860}
    >
      <ProductForm />
    </AdminShell>
  )
}
