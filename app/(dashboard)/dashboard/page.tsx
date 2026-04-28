import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { calculateStatus, STATUS_CONFIG } from '@/lib/utils/calculateStatus'
import { PaymentBadge } from '@/components/ui/PaymentBadge'
import { PaymentStatus } from '@/lib/types'
import {
  Building2, FileText, CreditCard, Users,
  AlertTriangle, TrendingUp, CheckCircle2, Clock,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Fetch stats in parallel
  const [entitiesRes, docsRes, membershipsRes, pendingProfilesRes] = await Promise.all([
    supabase.from('entities').select('id, name, type', { count: 'exact' })
      .eq(isAdmin ? 'is_active' : 'owner_id', isAdmin ? true : user.id),
    supabase.from('documents').select('id, expiry_date, verification_status')
      .eq(isAdmin ? 'verification_status' : 'profile_id', isAdmin ? 'pending' : user.id),
    supabase.from('memberships').select('id, payment_status, amount_due, amount_paid, valid_until')
      .eq(isAdmin ? 'payment_status' : 'profile_id', isAdmin ? 'overdue' : user.id),
    isAdmin
      ? supabase.from('profiles').select('id', { count: 'exact' }).eq('is_approved', false).eq('role', 'member')
      : Promise.resolve({ count: 0 }),
  ])

  const entities = entitiesRes.data ?? []
  const documents = docsRes.data ?? []
  const memberships = membershipsRes.data ?? []

  const expiringDocs = isAdmin
    ? documents.length
    : documents.filter((d) => calculateStatus(d.expiry_date) !== 'green').length

  const overdueMemberships = isAdmin
    ? memberships.length
    : memberships.filter((m) => m.payment_status === 'overdue').length

  const activeMembership = isAdmin ? null : memberships.find((m) => m.payment_status === 'paid')

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isAdmin ? 'Admin Dashboard' : `Welcome back, ${profile?.full_name?.split(' ')[0] ?? 'Member'}`}
        </h1>
        <p className="mt-1 text-slate-500">
          {isAdmin
            ? 'Manage members, approvals, and compliance across all entities.'
            : 'Your BBHA membership overview at a glance.'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={isAdmin ? 'Total Entities' : 'My Entities'}
          value={String(entities.length)}
          icon={Building2}
          color="blue"
        />
        <StatCard
          label={isAdmin ? 'Docs Pending Verification' : 'Document Alerts'}
          value={String(expiringDocs)}
          icon={FileText}
          color={expiringDocs > 0 ? 'amber' : 'green'}
        />
        <StatCard
          label={isAdmin ? 'Overdue Memberships' : 'Memberships'}
          value={isAdmin ? String(overdueMemberships) : String(memberships.length)}
          icon={CreditCard}
          color={overdueMemberships > 0 ? 'red' : 'green'}
        />
        {isAdmin ? (
          <StatCard
            label="Pending Approvals"
            value={String((pendingProfilesRes as { count: number }).count ?? 0)}
            icon={Users}
            color="purple"
          />
        ) : (
          <StatCard
            label="Membership Status"
            value={activeMembership ? 'Active' : 'Pending'}
            icon={activeMembership ? CheckCircle2 : Clock}
            color={activeMembership ? 'green' : 'amber'}
          />
        )}
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Member: Membership details */}
        {!isAdmin && memberships.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-500" />
              My Memberships
            </h2>
            <div className="space-y-3">
              {memberships.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Annual Membership</p>
                    <p className="text-xs text-slate-500">Valid until: {formatDate(m.valid_until)}</p>
                  </div>
                  <div className="text-right">
                    <PaymentBadge status={m.payment_status as PaymentStatus} size="sm" />
                    {m.payment_status !== 'paid' && (
                      <p className="mt-1 text-xs font-semibold text-red-600">{formatCurrency(m.amount_due)} due</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document compliance summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Compliance Status
          </h2>
          {documents.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">No documents uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 6).map((doc) => {
                const status = calculateStatus(doc.expiry_date)
                const cfg = STATUS_CONFIG[status]
                return (
                  <div key={doc.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${cfg.bg} ${cfg.border}`}>
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-xs text-slate-500">{doc.verification_status}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Admin: recent entities */}
        {isAdmin && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-base font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-500" />
              Recent Entities
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="text-xs text-slate-500">
                  <tr>
                    <th className="pb-2 text-left font-semibold">Name</th>
                    <th className="pb-2 text-left font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entities.slice(0, 8).map((e) => (
                    <tr key={e.id}>
                      <td className="py-2 font-medium text-slate-800">{e.name}</td>
                      <td className="py-2 text-slate-500">{e.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: string; icon: React.ElementType; color: 'blue' | 'green' | 'amber' | 'red' | 'purple'
}) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600 border-blue-100',
    green:  'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:  'bg-amber-50 text-amber-600 border-amber-100',
    red:    'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </div>
  )
}
