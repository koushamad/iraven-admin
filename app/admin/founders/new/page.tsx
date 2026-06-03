import FounderForm from '@/components/admin/FounderForm'
import AdminShell from '@/components/admin/AdminShell'

export default function NewFounderPage() {
  return (
    <AdminShell
      title="New Founder"
      subtitle="Add a new founder profile to the homepage."
      backHref="/admin/founders"
      backLabel="Founders"
      maxWidth={860}
    >
      <FounderForm />
    </AdminShell>
  )
}
