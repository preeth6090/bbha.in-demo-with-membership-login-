'use client'

import { useState } from 'react'
import { Vendor, VendorBadge } from '@/lib/types'
import { BADGE_DEFINITIONS, getDaysUntilExpiry } from '@/lib/utils/badges'
import { AlertTriangle, Mail, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

interface ExpiringEntry {
  badge: VendorBadge
  vendor: Vendor
}

interface ExpiringBadgesPanelProps {
  entries: ExpiringEntry[]
  onEmailSent?: (badgeId: string) => void
}

export function ExpiringBadgesPanel({ entries, onEmailSent }: ExpiringBadgesPanelProps) {
  const [open, setOpen] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [sent, setSent] = useState<Set<string>>(new Set())

  if (entries.length === 0) return null

  async function handleSendRenewal(entry: ExpiringEntry) {
    setSending(entry.badge.id)
    // In production this calls /api/email/vendor-renewal
    await new Promise((r) => setTimeout(r, 1200))
    setSending(null)
    setSent((prev) => new Set(prev).add(entry.badge.id))
    onEmailSent?.(entry.badge.id)
  }

  async function handleSendAll() {
    for (const entry of entries) {
      if (!sent.has(entry.badge.id)) await handleSendRenewal(entry)
    }
  }

  return (
    <div className="rounded-xl border-2 border-orange-300 bg-orange-50 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-orange-900">
              {entries.length} Badge{entries.length !== 1 ? 's' : ''} Expiring Within 7 Days
            </p>
            <p className="text-xs text-orange-700">
              Send renewal emails to vendors so they can pay via QR and extend their listing.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleSendAll() }}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
          >
            <Mail className="h-3.5 w-3.5" />
            Send All Renewals
          </button>
          {open ? <ChevronUp className="h-4 w-4 text-orange-600" /> : <ChevronDown className="h-4 w-4 text-orange-600" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-orange-200 px-5 py-3 space-y-2">
          {entries.map((entry) => {
            const def = BADGE_DEFINITIONS[entry.badge.badge_key]
            const days = getDaysUntilExpiry(entry.badge.expires_at)
            const isSent = sent.has(entry.badge.id)
            const isSending = sending === entry.badge.id

            return (
              <div
                key={entry.badge.id}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                  isSent ? 'border-emerald-200 bg-emerald-50' : 'border-orange-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-lg flex-shrink-0">{def?.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{entry.vendor.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{def?.label}</span>
                      <span>·</span>
                      <span className={`font-medium ${days !== null && days <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
                        {days === 0 ? 'Expires today' : `${days}d left`}
                      </span>
                    </div>
                    {entry.vendor.email && (
                      <p className="text-xs text-slate-400">{entry.vendor.email}</p>
                    )}
                  </div>
                </div>

                {isSent ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4" /> Email Sent
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendRenewal(entry)}
                    disabled={!!isSending}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-60"
                  >
                    {isSending
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</>
                      : <><Mail className="h-3.5 w-3.5" /> Send Renewal</>
                    }
                  </button>
                )}
              </div>
            )
          })}

          {/* Mobile send all */}
          <button
            onClick={handleSendAll}
            className="sm:hidden w-full flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-600 mt-2"
          >
            <Mail className="h-3.5 w-3.5" /> Send All Renewals
          </button>
        </div>
      )}
    </div>
  )
}
