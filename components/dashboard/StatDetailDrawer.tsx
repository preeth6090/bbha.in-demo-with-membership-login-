'use client'

import { X, Building2, FileText, CreditCard, Users } from 'lucide-react'
import { UserRole } from '@/lib/types'
import {
  MOCK_ENTITIES, MOCK_DOCUMENTS, MOCK_MEMBERSHIPS, MOCK_PENDING_MEMBERS,
} from '@/lib/mock-data'
import { PaymentBadge } from '@/components/ui/PaymentBadge'
import { formatDate, formatCurrency, formatDocumentType } from '@/lib/utils/formatters'

export type StatDrawerType =
  | 'entities'
  | 'doc_alerts'
  | 'overdue'
  | 'pending_approvals'
  | 'memberships'
  | 'membership_status'

const TITLES: Record<StatDrawerType, { label: string; icon: React.ElementType }> = {
  entities:          { label: 'All Entities',         icon: Building2 },
  doc_alerts:        { label: 'Document Alerts',       icon: FileText },
  overdue:           { label: 'Overdue Memberships',   icon: CreditCard },
  pending_approvals: { label: 'Pending Approvals',     icon: Users },
  memberships:       { label: 'All Memberships',       icon: CreditCard },
  membership_status: { label: 'My Membership',         icon: CreditCard },
}

const ENTITY_NAMES: Record<string, string> = {
  e1: 'The Grand Bangalore',
  e2: 'Spice Garden QSR',
  e3: 'Namma Bakery',
}

interface Props {
  type: StatDrawerType | null
  role: UserRole
  onClose: () => void
}

export function StatDetailDrawer({ type, role, onClose }: Props) {
  if (!type) return null

  const { label, icon: Icon } = TITLES[type]

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <Icon className="h-5 w-5 text-amber-500" />
          <h2 className="flex-1 text-lg font-bold text-slate-900">{label}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {type === 'entities' && <EntitiesDetail role={role} />}
          {type === 'doc_alerts' && <DocAlertsDetail />}
          {type === 'overdue' && <OverdueDetail />}
          {type === 'pending_approvals' && <PendingApprovalsDetail />}
          {(type === 'memberships' || type === 'membership_status') && <MembershipsDetail role={role} />}
        </div>
      </div>
    </>
  )
}

function EntitiesDetail({ role }: { role: UserRole }) {
  const entities = role === 'admin' ? MOCK_ENTITIES : MOCK_ENTITIES.slice(0, 1)
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{entities.length} establishment{entities.length !== 1 ? 's' : ''}</p>
      {entities.map((e) => (
        <div key={e.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{e.name}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{e.type} · {e.address}</p>
            </div>
            <span
              className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                e.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {e.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {e.gstin && (
              <div><p className="text-slate-400">GSTIN</p><p className="font-mono text-slate-700">{e.gstin}</p></div>
            )}
            {e.fssai_number && (
              <div><p className="text-slate-400">FSSAI</p><p className="font-mono text-slate-700">{e.fssai_number}</p></div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function DocAlertsDetail() {
  const alerts = MOCK_DOCUMENTS.filter((d) => d.verification_status !== 'verified')
  return (
    <div className="space-y-3">
      {alerts.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">All documents are verified.</p>
      ) : (
        alerts.map((d) => (
          <div key={d.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-slate-900">{formatDocumentType(d.document_type)}</p>
              <span
                className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  d.verification_status === 'rejected' || d.verification_status === 'expired'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {d.verification_status}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {d.document_number && (
                <div><p className="text-slate-400">Document No.</p><p className="font-mono text-slate-700">{d.document_number}</p></div>
              )}
              {d.expiry_date && (
                <div><p className="text-slate-400">Expires</p><p className="font-semibold text-slate-700">{formatDate(d.expiry_date)}</p></div>
              )}
            </div>
            {d.notes && (
              <p className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-xs italic text-red-700">{d.notes}</p>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function OverdueDetail() {
  const overdue = MOCK_MEMBERSHIPS.filter((m) => m.payment_status === 'overdue')
  return (
    <div className="space-y-3">
      {overdue.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No overdue memberships.</p>
      ) : (
        overdue.map((m) => (
          <div key={m.id} className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-slate-900">{ENTITY_NAMES[m.entity_id] ?? 'Entity'}</p>
              <PaymentBadge status={m.payment_status} size="sm" />
            </div>
            <p className="mt-1 font-mono text-xs text-slate-500">{m.membership_number}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-400">Amount Due</p>
                <p className="font-bold text-red-700">{formatCurrency(m.amount_due)}</p>
              </div>
              <div>
                <p className="text-slate-400">Due Date</p>
                <p className="font-semibold text-slate-800">{formatDate(m.due_date)}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function PendingApprovalsDetail() {
  return (
    <div className="space-y-3">
      {MOCK_PENDING_MEMBERS.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No pending approvals.</p>
      ) : (
        MOCK_PENDING_MEMBERS.map((m) => (
          <div key={m.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{m.full_name}</p>
                <p className="mt-0.5 text-xs text-slate-600">{m.email}</p>
                <p className="text-xs text-slate-500">{m.phone}</p>
                <p className="mt-1 text-xs text-slate-400">Registered {formatDate(m.created_at)}</p>
              </div>
              <button className="flex-shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600">
                Approve
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function MembershipsDetail({ role }: { role: UserRole }) {
  const memberships = role === 'admin' ? MOCK_MEMBERSHIPS : MOCK_MEMBERSHIPS.slice(0, 1)
  return (
    <div className="space-y-3">
      {memberships.map((m) => (
        <div key={m.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{ENTITY_NAMES[m.entity_id] ?? 'Entity'}</p>
              <p className="mt-0.5 font-mono text-xs text-slate-500">{m.membership_number}</p>
            </div>
            <PaymentBadge status={m.payment_status} size="sm" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-400">Plan</p>
              <p className="font-semibold capitalize text-slate-800">{m.plan}</p>
            </div>
            <div>
              <p className="text-slate-400">Amount Paid</p>
              <p className="font-semibold text-slate-800">{formatCurrency(m.amount_paid)}</p>
            </div>
            <div>
              <p className="text-slate-400">Valid From</p>
              <p className="font-semibold text-slate-800">{formatDate(m.valid_from)}</p>
            </div>
            <div>
              <p className="text-slate-400">Valid Until</p>
              <p className="font-semibold text-slate-800">{formatDate(m.valid_until)}</p>
            </div>
            {m.payment_reference && (
              <div className="col-span-2">
                <p className="text-slate-400">Payment Ref.</p>
                <p className="font-mono text-slate-700">{m.payment_reference}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
