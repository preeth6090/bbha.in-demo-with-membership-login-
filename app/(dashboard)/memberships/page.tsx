import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PaymentBadge } from '@/components/ui/PaymentBadge'
import { ContentGuard } from '@/components/ui/ContentGuard'
import { Membership, PaymentStatus, UserRole } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { CreditCard, Calendar, Hash } from 'lucide-react'

export default async function MembershipsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const role = (profile?.role ?? 'member') as UserRole

  const query = supabase.from('memberships')
    .select('*, entities(name, type)')
    .order('created_at', { ascending: false })

  const { data: memberships } = role === 'admin'
    ? await query
    : await query.eq('profile_id', user.id)

  const items = (memberships ?? []) as (Membership & { entities: { name: string; type: string } | null })[]

  const hasActiveMembership = items.some(
    (m) => m.payment_status === 'paid' || m.payment_status === 'waived'
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {role === 'admin' ? 'All Memberships' : 'My Memberships & Dues'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {role === 'admin' ? 'Track payment status and manage dues across all members.' : 'View your membership status and pay outstanding dues.'}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16">
          <CreditCard className="h-12 w-12 text-slate-300" />
          <p className="mt-3 text-slate-500">No memberships found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((m) => (
            <MembershipCard key={m.id} membership={m} role={role} entityName={m.entities?.name} />
          ))}
        </div>
      )}

      {/* Locked premium content for unpaid members */}
      {role === 'member' && (
        <ContentGuard
          paymentStatus={hasActiveMembership ? 'paid' : 'pending'}
          featureName="vendor contacts & magazine access"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-2 text-base font-semibold text-slate-900">Member Exclusive Content</h2>
            <p className="text-sm text-slate-500">
              Access vendor contacts, industry magazine, and member-only resources here.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {['Vendor Directory', 'BBHA Magazine', 'Event Invites', 'Trade Contacts'].map((item) => (
                <div key={item} className="rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </ContentGuard>
      )}
    </div>
  )
}

function MembershipCard({
  membership: m, role, entityName,
}: {
  membership: Membership; role: UserRole; entityName?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
            <CreditCard className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {entityName ?? 'Membership'}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {m.membership_number && (
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {m.membership_number}
                </span>
              )}
              <span className="capitalize">{m.plan} plan</span>
            </div>
          </div>
        </div>
        <PaymentBadge status={m.payment_status as PaymentStatus} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoBlock label="Amount Due" value={formatCurrency(m.amount_due)} highlight={m.payment_status === 'overdue'} />
        <InfoBlock label="Amount Paid" value={formatCurrency(m.amount_paid)} />
        <InfoBlock label="Due Date" value={formatDate(m.due_date)} icon={Calendar} />
        <InfoBlock label="Valid Until" value={formatDate(m.valid_until)} icon={Calendar} />
      </div>

      {m.payment_status !== 'paid' && m.payment_status !== 'waived' && role === 'member' && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-amber-800">Payment outstanding</p>
            <p className="text-xs text-amber-600">Renew to access all member benefits</p>
          </div>
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
            Pay Now
          </button>
        </div>
      )}
    </div>
  )
}

function InfoBlock({ label, value, icon: Icon, highlight }: {
  label: string; value: string; icon?: React.ElementType; highlight?: boolean
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 flex items-center gap-1 text-sm font-semibold ${highlight ? 'text-red-600' : 'text-slate-800'}`}>
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {value}
      </p>
    </div>
  )
}
