import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CSVImporter } from '@/components/admin/CSVImporter'
import { formatDate } from '@/lib/utils/formatters'
import { UserCheck, UserX, Mail, Phone, Users } from 'lucide-react'
import { ApproveButton } from './ApproveButton'

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: members } = await supabase
    .from('profiles')
    .select('*, entities(id, name, type)')
    .eq('role', 'member')
    .order('created_at', { ascending: false })

  const pending = members?.filter((m) => !m.is_approved) ?? []
  const approved = members?.filter((m) => m.is_approved) ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Member Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Approve registrations, manage members, and bulk import.
        </p>
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-900">
            <UserX className="h-5 w-5" />
            Pending Approvals ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{m.full_name ?? m.email}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>
                    {m.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>}
                    <span>Registered {formatDate(m.created_at)}</span>
                  </div>
                </div>
                <ApproveButton profileId={m.id} email={m.email} name={m.full_name} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSV Importer */}
      <CSVImporter />

      {/* All approved members */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <Users className="h-5 w-5 text-slate-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Active Members ({approved.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                <th className="px-4 py-3 text-left font-semibold">Entities</th>
                <th className="px-4 py-3 text-left font-semibold">Joined</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approved.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{m.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.email}</td>
                  <td className="px-4 py-3 text-slate-600">{m.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.entities?.length ?? 0}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <UserCheck className="h-3.5 w-3.5" /> Approved
                    </span>
                  </td>
                </tr>
              ))}
              {approved.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No approved members yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
