'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, Eye, FileText, X, AlertTriangle } from 'lucide-react'
import { PaymentSubmission, SubmissionStatus } from '@/lib/types'
import { formatDate } from '@/lib/utils/formatters'
import { generateInvoiceHTML, openInvoiceInNewTab } from '@/lib/utils/generateInvoice'

// For demo we import mock settings/entities inline
import { MOCK_INVOICE_SETTINGS, MOCK_ENTITIES, MOCK_ADMIN, MOCK_MEMBER } from '@/lib/mock-data'
import { MOCK_MEMBERSHIPS } from '@/lib/mock-data'

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  pending:  { label: 'Pending',  bg: 'bg-amber-100',  text: 'text-amber-700',   icon: Clock },
  verified: { label: 'Verified', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: 'bg-red-100',    text: 'text-red-700',     icon: XCircle },
}

const METHOD_LABELS: Record<string, string> = {
  upi: 'UPI', neft: 'NEFT', rtgs: 'RTGS', imps: 'IMPS', cash: 'Cash/Cheque', other: 'Other',
}

interface Props {
  submissions: PaymentSubmission[]
  onVerify: (id: string, invoiceNumber: string) => void
  onReject: (id: string, reason: string) => void
}

type FilterStatus = 'all' | SubmissionStatus

export function UTRVerificationPanel({ submissions, onVerify, onReject }: Props) {
  const [filter, setFilter]         = useState<FilterStatus>('all')
  const [verifyTarget, setVerify]   = useState<PaymentSubmission | null>(null)
  const [rejectTarget, setReject]   = useState<PaymentSubmission | null>(null)
  const [invoiceNo, setInvoiceNo]   = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [invoiceErr, setInvoiceErr] = useState<string | null>(null)

  const filtered = filter === 'all' ? submissions : submissions.filter((s) => s.status === filter)
  const pending  = submissions.filter((s) => s.status === 'pending').length

  function handleVerifySubmit() {
    if (!invoiceNo.trim()) { setInvoiceErr('Invoice number is required'); return }
    if (!verifyTarget) return
    onVerify(verifyTarget.id, invoiceNo.trim().toUpperCase())
    setVerify(null)
    setInvoiceNo('')
    setInvoiceErr(null)
  }

  function handleRejectSubmit() {
    if (!rejectTarget || !rejectReason.trim()) return
    onReject(rejectTarget.id, rejectReason.trim())
    setReject(null)
    setRejectReason('')
  }

  function handleViewInvoice(sub: PaymentSubmission) {
    const membership = MOCK_MEMBERSHIPS.find((m) => m.id === sub.membership_id)
    const entity = MOCK_ENTITIES.find((e) => e.id === (membership?.entity_id ?? ''))
    if (!membership || !entity) return
    const html = generateInvoiceHTML({
      settings: MOCK_INVOICE_SETTINGS,
      submission: sub,
      membership,
      entity,
      member: MOCK_MEMBER as never,
      invoiceDate: sub.verified_at ?? sub.submitted_at,
    })
    openInvoiceInNewTab(html)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">Payment Verifications</h2>
          {pending > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
              {pending}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'verified', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                filter === s ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-400">No submissions found.</div>
        )}
        {filtered.map((sub) => {
          const cfg = STATUS_CONFIG[sub.status]
          const Icon = cfg.icon
          return (
            <div key={sub.id} className="px-6 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                      <Icon className="h-3 w-3" />{cfg.label}
                    </span>
                    <span className="text-xs text-slate-400">{METHOD_LABELS[sub.payment_method]}</span>
                  </div>
                  <p className="mt-2 font-mono text-sm font-semibold text-slate-900">{sub.utr_number}</p>
                  <p className="text-xs text-slate-500">
                    ₹{sub.amount_paid.toLocaleString('en-IN')} &nbsp;·&nbsp; Submitted {formatDate(sub.submitted_at)}
                  </p>
                  {sub.invoice_number && (
                    <p className="mt-1 text-xs text-emerald-600 font-medium">Invoice: {sub.invoice_number}</p>
                  )}
                  {sub.rejection_reason && (
                    <p className="mt-1 text-xs text-red-600 italic">{sub.rejection_reason}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {sub.status === 'pending' && (
                    <>
                      <button
                        onClick={() => { setVerify(sub); setInvoiceNo('') }}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verify
                      </button>
                      <button
                        onClick={() => { setReject(sub); setRejectReason('') }}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </>
                  )}
                  {sub.status === 'verified' && (
                    <button
                      onClick={() => handleViewInvoice(sub)}
                      className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                    >
                      <Eye className="h-3.5 w-3.5" /> Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Verify modal */}
      {verifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-slate-900">Verify Payment</h3>
              <button onClick={() => setVerify(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-5">
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs text-emerald-700">UTR: <strong className="font-mono">{verifyTarget.utr_number}</strong></p>
                <p className="text-xs text-emerald-700">Amount: <strong>₹{verifyTarget.amount_paid.toLocaleString('en-IN')}</strong></p>
              </div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Assign Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => { setInvoiceNo(e.target.value); setInvoiceErr(null) }}
                placeholder={`${MOCK_INVOICE_SETTINGS.invoice_prefix}/2026/1001`}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-mono text-sm uppercase focus:border-amber-400 focus:outline-none"
              />
              {invoiceErr && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5" />{invoiceErr}
                </p>
              )}
              <div className="mt-4 flex gap-3">
                <button onClick={() => setVerify(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600">Cancel</button>
                <button onClick={handleVerifySubmit} className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
                  Verify & Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-slate-900">Reject Payment</h3>
              <button onClick={() => setReject(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Reason for rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. UTR not found in bank records, amount mismatch…"
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-red-400 focus:outline-none"
                rows={3}
              />
              <div className="mt-4 flex gap-3">
                <button onClick={() => setReject(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600">Cancel</button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim()}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
