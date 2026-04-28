'use client'

import { useState } from 'react'
import { X, QrCode, Building2, CheckCircle2, AlertTriangle, Copy } from 'lucide-react'
import { InvoiceSettings, Membership } from '@/lib/types'

function validateUTR(utr: string): string | null {
  const cleaned = utr.trim().toUpperCase()
  if (!cleaned) return 'UTR / reference number is required'
  if (cleaned.length < 12) return 'UTR must be at least 12 characters'
  if (cleaned.length > 22) return 'UTR must be at most 22 characters'
  if (!/^[A-Z0-9]+$/.test(cleaned)) return 'UTR may only contain letters and digits'
  return null
}

interface Props {
  membership: Membership
  settings: InvoiceSettings
  onSubmit: (utr: string, method: string) => Promise<void>
  onClose: () => void
}

type Step = 'pay' | 'utr' | 'done'
type Method = 'upi' | 'neft' | 'imps' | 'cash'

const METHODS: { id: Method; label: string }[] = [
  { id: 'upi',  label: 'UPI / QR' },
  { id: 'neft', label: 'NEFT / RTGS' },
  { id: 'imps', label: 'IMPS' },
  { id: 'cash', label: 'Cash / Cheque' },
]

export function PaymentModal({ membership, settings, onSubmit, onClose }: Props) {
  const [step, setStep]       = useState<Step>('pay')
  const [method, setMethod]   = useState<Method>('upi')
  const [utr, setUtr]         = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)

  const amount  = membership.amount_due || settings.membership_fee
  const upiLink = `upi://pay?pa=${settings.upi_id}&pn=BBHA&am=${amount}&cu=INR&tn=Membership+Fee`
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`

  function copyUPI() {
    navigator.clipboard.writeText(settings.upi_id).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSubmit() {
    const err = validateUTR(utr)
    if (err) { setError(err); return }
    setError(null)
    setLoading(true)
    try {
      await onSubmit(utr.trim().toUpperCase(), method)
      setStep('done')
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Pay Membership Fee</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {step === 'done' ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Payment Submitted!</h3>
            <p className="text-sm text-slate-500">
              Your UTR has been submitted for verification. You&apos;ll receive a notification once the admin verifies your payment and your invoice is ready.
            </p>
            <button onClick={onClose} className="mt-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">
              Done
            </button>
          </div>
        ) : step === 'pay' ? (
          <div className="p-6">
            {/* Amount banner */}
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Amount to Pay</p>
              <p className="mt-1 text-3xl font-bold text-amber-800">
                ₹{amount.toLocaleString('en-IN')}
              </p>
              <p className="mt-0.5 text-xs text-amber-600">Inclusive of 18% GST (CGST + SGST)</p>
            </div>

            {/* Payment method tabs */}
            <div className="mb-4 flex gap-1.5 rounded-xl bg-slate-100 p-1">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    method === m.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {method === 'upi' && (
              <div className="flex flex-col items-center gap-3">
                <img src={qrUrl} alt="UPI QR Code" className="h-52 w-52 rounded-xl border-2 border-amber-200" />
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="font-mono text-sm text-slate-700">{settings.upi_id}</span>
                  <button onClick={copyUPI} className="rounded p-0.5 text-slate-400 hover:text-slate-700">
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-center text-xs text-slate-500">
                  Scan the QR code with any UPI app — PhonePe, GPay, Paytm, or BHIM
                </p>
              </div>
            )}

            {(method === 'neft' || method === 'imps') && settings.bank_account && (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                {[
                  ['Bank Name', settings.bank_name],
                  ['Account Number', settings.bank_account],
                  ['IFSC Code', settings.bank_ifsc],
                  ['Account Name', settings.bbha_name],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="font-mono text-xs font-medium text-slate-800">{value || '—'}</span>
                  </div>
                ))}
              </div>
            )}

            {method === 'cash' && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-medium">Pay at BBHA Office</p>
                <p className="mt-1 text-xs">{settings.bbha_address}</p>
                <p className="mt-2 text-xs">Collect a receipt and enter the receipt number as your UTR in the next step.</p>
              </div>
            )}

            <button
              onClick={() => setStep('utr')}
              className="mt-5 w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600"
            >
              I have paid — Enter UTR →
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <QrCode className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <p className="text-xs text-blue-700">
                Enter the <strong>UTR / Transaction Reference</strong> from your payment app or bank statement. This is used to verify your payment.
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                UTR / Transaction Reference No.
              </label>
              <input
                type="text"
                value={utr}
                onChange={(e) => { setUtr(e.target.value); setError(null) }}
                placeholder="e.g. T2604271234567890"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm uppercase tracking-wide placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
              {error && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5" />{error}
                </div>
              )}
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Building2 className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Amount paid</p>
                <p className="text-sm font-bold text-slate-900">₹{amount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('pay')} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !utr.trim()}
                className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
