import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatutoryTable } from '@/components/compliance/StatutoryTable'
import { Document, UserRole } from '@/lib/types'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const role = (profile?.role ?? 'member') as UserRole

  const query = supabase.from('documents')
    .select('*')
    .order('expiry_date', { ascending: true })

  const { data: documents } = role === 'admin'
    ? await query
    : await query.eq('profile_id', user.id)

  // Get the user's first entity for the add form
  const { data: entity } = await supabase
    .from('entities').select('id').eq('owner_id', user.id).limit(1).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compliance Vault</h1>
        <p className="mt-1 text-sm text-slate-500">
          {role === 'admin'
            ? 'Verify and manage statutory documents across all members.'
            : 'Manage your business licenses and statutory documents.'}
        </p>
      </div>

      <StatutoryTable
        documents={(documents as Document[]) ?? []}
        entityId={entity?.id ?? ''}
        profileId={user.id}
        role={role}
      />
    </div>
  )
}
