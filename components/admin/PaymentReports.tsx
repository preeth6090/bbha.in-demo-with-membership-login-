'use client'

import { useState, useMemo } from 'react'
import { Download, Filter, TrendingUp, IndianRupee } from 'lucide-react'
import { PaymentSubmission } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

type Category = 'all' | 'membership' | 'vendor'
type Period = 'all' | 'today' | 'month' | 'year' | 'fy' | 'custom'

interface Props {
  submissions: PaymentSubmission[]
}

function getFinancialYear(date: Date) {
  const month = date.getMonth()
  const year  = date.getFullYear()
  return month >= 3 ? year : year - 1
}

export function PaymentReports({ submissions }: Props) {
  const [category, setCategory] = useState<Category>('all')
  const [period, setPeriod]     = useState<Period>('month')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate]     = useState('')

  const filtered = useMemo(() => {
    const now = new Date()
    return submissions.filter((s) => {
      // Category filter (all submissions in demo are membership)
      if (category === 'vendor') return false

      const d = new Date(s.submitted_at)
      if (period === 'today') {
        return d.toDateString() === now.toDateString()
      }
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      if (period === 'year') {
        return d.getFullYear() === now.getFullYear()
      }
      if (period === 'fy') {
        const fy = getFinancialYear(now)
        return d >= new Date(`${fy}-04-01`) && d < new Date(`${fy + 1}-04-01`)
      }
      if (period === 'custom' && fromDate && toDate) {
        return d >= new Date(fromDate) && d <= new Date(toDate + 'T23:59:59')
      }
      return true
    })
  }, [submissions, category, period, fromDate, toDate])

  const verified   = filtered.filter((s) => s.status === 'verified')
  const pending    = filtered.filter((s) => s.status === 'pending')
  const rejected   = filtered.filter((s) => s.status === 'rejected')
  const totalAmnt  = verified.reduce((sum, s) => sum + s.amount_paid, 0)
  const pendingAmt = pending.reduce((sum, s) => sum + s.amount_paid, 0)

  const PERIOD_LABELS: Record<Period, string> = {
    all: 'All Time', today: 'Today', month: 'This Month',
    year: 'This Year', fy: 'This FY', custom: 'Custom Range',
  }

  function exportCSV() {
    const rows = [
      ['UTR', 'Amount', 'Method', 'Status', 'Invoice No', 'Submitted', 'Verified'],
      ...filtered.map((s) => [
        s.utr_number, s.amount_paid, s.payment_method, s.status,
        s.invoice_number ?? '', s.submitted_at, s.verified_at ?? '',
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `bbha_payments_${period}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-600">Category</p>
          <div className="flex gap-1.5">
            {(['all', 'membership', 'vendor'] as Category[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  category === c ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c === 'all' ? 'All Fees' : c === 'membership' ? 'Membership' : 'Vendor Badges'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-600">Period</p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  period === p ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div className="flex items-end gap-2">
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-600">From</p>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-600">To</p>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none" />
            </div>
          </div>
        )}

        <button
          onClick={exportCSV}
          className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Amount Collected',  value: formatCurrency(totalAmnt),  color: 'emerald', icon: IndianRupee },
          { label: 'Verified Payments', value: String(verified.length),    color: 'blue',    icon: TrendingUp },
          { label: 'Pending Amount',    value: formatCurrency(pendingAmt), color: 'amber',   icon: Filter },
          { label: 'Rejected',          value: String(rejected.length),    color: 'red',     icon: Filter },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-${color}-50 text-${color}-600`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">UTR / Ref</th>
              <th className="px-4 py-3 text-left font-semibold">Method</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Invoice No</th>
              <th className="px-4 py-3 text-left font-semibold">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-400">No records for selected period.</td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-800">{s.utr_number}</td>
                  <td className="px-4 py-3 uppercase text-slate-600">{s.payment_method}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(s.amount_paid)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      s.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                      s.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                    }`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{s.invoice_number ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(s.submitted_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
