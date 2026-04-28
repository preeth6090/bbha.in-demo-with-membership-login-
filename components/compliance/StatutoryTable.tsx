'use client'

import { useState } from 'react'
import { Document, UserRole, DocumentType } from '@/lib/types'
import { calculateStatus, STATUS_CONFIG, daysUntilExpiry } from '@/lib/utils/calculateStatus'
import { formatDate, formatDocumentType } from '@/lib/utils/formatters'
import { createClient } from '@/lib/supabase/client'
import {
  FileText, Upload, Plus, ChevronDown, ChevronUp, Shield, XCircle,
  AlertTriangle, CheckCircle2, Clock
} from 'lucide-react'

interface StatutoryTableProps {
  documents: Document[]
  entityId: string
  profileId: string
  role: UserRole
  onRefresh?: () => void
}

const DOCUMENT_TYPES: DocumentType[] = [
  'FSSAI', 'BBMP_Trade_License', 'GST_Certificate',
  'Fire_NOC', 'Health_License', 'Liquor_License', 'Other',
]

function StatusDot({ expiryDate }: { expiryDate: string | null }) {
  const status = calculateStatus(expiryDate)
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        status === 'green' ? 'bg-emerald-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
      }`} />
      {cfg.label}
    </span>
  )
}

export function StatutoryTable({ documents, entityId, profileId, role, onRefresh }: StatutoryTableProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [sortField, setSortField] = useState<'expiry_date' | 'document_type'>('expiry_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    document_type: 'FSSAI' as DocumentType,
    document_number: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
  })

  const supabase = createClient()

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = [...documents].sort((a, b) => {
    const av = a[sortField] ?? ''
    const bv = b[sortField] ?? ''
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('documents').insert({
      ...form,
      entity_id: entityId,
      profile_id: profileId,
      verification_status: 'pending',
    })
    setForm({ document_type: 'FSSAI', document_number: '', issuing_authority: '', issue_date: '', expiry_date: '' })
    setShowAddForm(false)
    setLoading(false)
    onRefresh?.()
  }

  async function handleVerify(docId: string) {
    await supabase.from('documents').update({
      verification_status: 'verified',
      verified_by: profileId,
      verified_at: new Date().toISOString(),
    }).eq('id', docId)
    onRefresh?.()
  }

  async function handleReject(docId: string) {
    await supabase.from('documents').update({ verification_status: 'rejected' }).eq('id', docId)
    onRefresh?.()
  }

  // Summary counts
  const expiring = documents.filter((d) => {
    const days = daysUntilExpiry(d.expiry_date)
    return days !== null && days >= 0 && days < 90
  }).length
  const expired = documents.filter((d) => calculateStatus(d.expiry_date) === 'red').length

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (
      sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
    ) : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <FileText className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Compliance Vault</h2>
            <p className="text-xs text-slate-500">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap items-center gap-2">
          {expired > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200">
              <AlertTriangle className="h-3 w-3" /> {expired} expired
            </span>
          )}
          {expiring > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
              <Clock className="h-3 w-3" /> {expiring} expiring soon
            </span>
          )}
          {role === 'member' && (
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white hover:bg-amber-600"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Document
            </button>
          )}
        </div>
      </div>

      {/* Add form (member only) */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Add New Document</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Document Type *</label>
              <select
                value={form.document_type}
                onChange={(e) => setForm((f) => ({ ...f, document_type: e.target.value as DocumentType }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                required
              >
                {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{formatDocumentType(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Document Number</label>
              <input
                type="text"
                value={form.document_number}
                onChange={(e) => setForm((f) => ({ ...f, document_number: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                placeholder="e.g. 11225523000123"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Issuing Authority</label>
              <input
                type="text"
                value={form.issuing_authority}
                onChange={(e) => setForm((f) => ({ ...f, issuing_authority: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                placeholder="e.g. FSSAI, BBMP"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Issue Date *</label>
              <input
                type="date"
                value={form.issue_date}
                onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Expiry Date *</label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {loading ? 'Saving…' : 'Save Document'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th
                className="cursor-pointer px-6 py-3 text-left hover:text-slate-700"
                onClick={() => toggleSort('document_type')}
              >
                <span className="flex items-center gap-1">Document Type <SortIcon field="document_type" /></span>
              </th>
              <th className="px-4 py-3 text-left">Number / Authority</th>
              <th className="px-4 py-3 text-left">Issue Date</th>
              <th
                className="cursor-pointer px-4 py-3 text-left hover:text-slate-700"
                onClick={() => toggleSort('expiry_date')}
              >
                <span className="flex items-center gap-1">Expiry Date <SortIcon field="expiry_date" /></span>
              </th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Verification</th>
              {role === 'admin' && <th className="px-4 py-3 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={role === 'admin' ? 7 : 6} className="py-10 text-center text-sm text-slate-400">
                  No documents uploaded yet.
                </td>
              </tr>
            ) : (
              sorted.map((doc) => {
                const days = daysUntilExpiry(doc.expiry_date)
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 text-sm font-medium text-slate-800">
                      {formatDocumentType(doc.document_type)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div className="font-mono">{doc.document_number ?? '—'}</div>
                      <div className="text-slate-400">{doc.issuing_authority ?? '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDate(doc.issue_date)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <div>{formatDate(doc.expiry_date)}</div>
                      {days !== null && days < 90 && (
                        <div className={`text-xs ${days < 0 ? 'text-red-500' : 'text-amber-500'}`}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusDot expiryDate={doc.expiry_date} />
                    </td>
                    <td className="px-4 py-3">
                      {doc.verification_status === 'verified' && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      )}
                      {doc.verification_status === 'pending' && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Clock className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                      {doc.verification_status === 'rejected' && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <XCircle className="h-3.5 w-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                    {role === 'admin' && (
                      <td className="px-4 py-3">
                        {doc.verification_status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleVerify(doc.id)}
                              className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                            >
                              <Shield className="h-3 w-3" /> Verify
                            </button>
                            <button
                              onClick={() => handleReject(doc.id)}
                              className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
