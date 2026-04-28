'use client'

import { Document, UserRole } from '@/lib/types'
import { calculateStatus, STATUS_CONFIG, daysUntilExpiry } from '@/lib/utils/calculateStatus'
import { formatDate, formatDocumentType } from '@/lib/utils/formatters'
import { FileText, CheckCircle2, XCircle, Clock, ExternalLink, Shield } from 'lucide-react'

interface DocumentRowProps {
  document: Document
  role: UserRole
  onVerify?: (doc: Document) => void
  onReject?: (doc: Document) => void
}

const VERIFICATION_ICON: Record<string, React.ElementType> = {
  verified: CheckCircle2,
  rejected:  XCircle,
  pending:   Clock,
  expired:   XCircle,
}

const VERIFICATION_COLOR: Record<string, string> = {
  verified: 'text-emerald-600',
  rejected:  'text-red-500',
  pending:   'text-amber-500',
  expired:   'text-slate-400',
}

export function DocumentRow({ document: doc, role, onVerify, onReject }: DocumentRowProps) {
  const status = calculateStatus(doc.expiry_date)
  const cfg = STATUS_CONFIG[status]
  const days = daysUntilExpiry(doc.expiry_date)
  const VerIcon = VERIFICATION_ICON[doc.verification_status]

  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md">
      {/* Doc type icon */}
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${cfg.bg} ${cfg.border} border`}>
        <FileText className={`h-5 w-5 ${cfg.color}`} />
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">
            {formatDocumentType(doc.document_type)}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {cfg.label}
            {days !== null && days < 90 && ` · ${Math.abs(days)}d ${days < 0 ? 'overdue' : 'left'}`}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
          {doc.document_number && <span>No. {doc.document_number}</span>}
          {doc.issuing_authority && <span>{doc.issuing_authority}</span>}
          <span>Issued: {formatDate(doc.issue_date)}</span>
          <span>Expires: {formatDate(doc.expiry_date)}</span>
        </div>
      </div>

      {/* Verification status */}
      <div className="hidden items-center gap-1 sm:flex">
        <VerIcon className={`h-4 w-4 ${VERIFICATION_COLOR[doc.verification_status]}`} />
        <span className={`text-xs font-medium capitalize ${VERIFICATION_COLOR[doc.verification_status]}`}>
          {doc.verification_status}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {doc.file_url && (
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        {/* Admin: verify / reject actions */}
        {role === 'admin' && doc.verification_status === 'pending' && (
          <>
            <button
              onClick={() => onVerify?.(doc)}
              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
            >
              <Shield className="h-3 w-3" />
              Verify
            </button>
            <button
              onClick={() => onReject?.(doc)}
              className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              <XCircle className="h-3 w-3" />
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}
