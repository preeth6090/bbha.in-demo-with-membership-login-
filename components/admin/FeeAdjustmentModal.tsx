'use client'

import { useState } from 'react'
import { Membership } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/formatters'
import { createClient } from '@/lib/supabase/client'
import { X, DollarSign, AlertCircle } from 'lucide-react'

interface FeeAdjustmentModalProps {
  membership: Membership
  adminId: string
  onClose: () => void
  onSuccess?: () => void
}

export function FeeAdjustmentModal({ membership, adminId, onClose, onSuccess }: FeeAdjustmentModalProps) {
  const [adjustedAmount, setAdjustedAmount] = useState(String(membership.amount_due))
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const diff = Number(adjustedAmount) - membership.amount_due
  const isReduction = diff < 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) { setError('Please provide a reason for the adjustment.'); return }
    if (Number(adjustedAmount) < 0) { setError('Amount cannot be negative.'); return }

    setLoading(true)
    setError('')

    const [adjustRes, memberRes] = await Promise.all([
      supabase.from('fee_adjustments').insert({
        membership_id: membership.id,
        adjusted_by: adminId,
        original_amount: membership.amount_due,
        adjusted_amount: Number(adjustedAmount),
        reason: reason.trim(),
      }),
      supabase.from('memberships').update({ amount_due: Number(adjustedAmount) }).eq('id', membership.id),
    ])

    if (adjustRes.error || memberRes.error) {
      setError('Failed to save adjustment. Please try again.')
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Override Fee</h2>
              <p className="text-xs text-slate-500">Membership #{membership.membership_number ?? membership.id.slice(0, 8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {/* Current fee display */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Current Amount Due</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(membership.amount_due)}</p>
            </div>
            <div className={`rounded-lg p-3 ${diff !== 0 ? (isReduction ? 'bg-emerald-50' : 'bg-red-50') : 'bg-slate-50'}`}>
              <p className="text-xs text-slate-500">Adjustment</p>
              <p className={`text-lg font-bold ${diff !== 0 ? (isReduction ? 'text-emerald-700' : 'text-red-700') : 'text-slate-400'}`}>
                {diff === 0 ? '—' : `${isReduction ? '−' : '+'}${formatCurrency(Math.abs(diff))}`}
              </p>
            </div>
          </div>

          {/* New amount */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              New Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={adjustedAmount}
                onChange={(e) => setAdjustedAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-8 pr-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reason for Adjustment *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              placeholder="e.g. Hardship waiver, Early bird discount, Promotional rate…"
              required
            />
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Apply Override'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
