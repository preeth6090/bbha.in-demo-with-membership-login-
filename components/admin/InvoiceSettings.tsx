'use client'

import { useState } from 'react'
import { Save, Settings, IndianRupee, Building2, QrCode } from 'lucide-react'
import { InvoiceSettings as ISettings } from '@/lib/types'

interface Props {
  settings: ISettings
  onSave: (settings: ISettings) => void
}

export function InvoiceSettings({ settings, onSave }: Props) {
  const [form, setForm] = useState<ISettings>({ ...settings })
  const [saved, setSaved] = useState(false)

  function update(key: keyof ISettings, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    onSave({ ...form, updated_at: new Date().toISOString() })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputCls = 'w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-slate-600'

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">Invoice & Billing Settings</h2>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            saved ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          <Save className="h-4 w-4" />
          {saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      {/* BBHA Details */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">BBHA Organisation Details</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Organisation Name</label>
            <input type="text" value={form.bbha_name} onChange={(e) => update('bbha_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>GSTIN <span className="text-red-500">*</span></label>
            <input type="text" value={form.bbha_gstin} onChange={(e) => update('bbha_gstin', e.target.value.toUpperCase())}
              placeholder="29AAAAA0000A1Z5" className={`${inputCls} font-mono tracking-wide`} maxLength={15} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input type="text" value={form.bbha_phone} onChange={(e) => update('bbha_phone', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.bbha_email} onChange={(e) => update('bbha_email', e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Registered Address</label>
            <textarea value={form.bbha_address} onChange={(e) => update('bbha_address', e.target.value)}
              className={`${inputCls} resize-none`} rows={2} />
          </div>
        </div>
      </section>

      <div className="border-t border-slate-100" />

      {/* Fee & Tax */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Fee & Tax Configuration</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Membership Fee (₹) <span className="text-red-500">*</span></label>
            <input type="number" value={form.membership_fee} onChange={(e) => update('membership_fee', Number(e.target.value))}
              min={0} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>GST Rate (%)</label>
            <input type="number" value={form.gst_rate} onChange={(e) => update('gst_rate', Number(e.target.value))}
              min={0} max={28} step={0.01} className={inputCls} />
            <p className="mt-1 text-[11px] text-slate-400">Intrastate Karnataka: split equally as CGST + SGST</p>
          </div>
          <div>
            <label className={labelCls}>SAC Code <span className="text-red-500">*</span></label>
            <input type="text" value={form.sac_code} onChange={(e) => update('sac_code', e.target.value)}
              placeholder="997221" className={`${inputCls} font-mono`} maxLength={8} />
            <p className="mt-1 text-[11px] text-slate-400">Service Accounting Code for membership services</p>
          </div>
        </div>
      </section>

      <div className="border-t border-slate-100" />

      {/* Invoice numbering */}
      <section>
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Invoice Numbering</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Invoice Prefix</label>
            <input type="text" value={form.invoice_prefix} onChange={(e) => update('invoice_prefix', e.target.value.toUpperCase())}
              placeholder="BBHA" className={`${inputCls} font-mono`} maxLength={10} />
          </div>
          <div>
            <label className={labelCls}>Current Counter</label>
            <input type="number" value={form.invoice_counter} onChange={(e) => update('invoice_counter', Number(e.target.value))}
              min={1} className={`${inputCls} font-mono`} />
            <p className="mt-1 text-[11px] text-slate-400">
              Next invoice: {form.invoice_prefix}/2026/{form.invoice_counter + 1}
            </p>
          </div>
        </div>
      </section>

      <div className="border-t border-slate-100" />

      {/* Payment details */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Payment Details (shown to members)</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>UPI ID</label>
            <input type="text" value={form.upi_id} onChange={(e) => update('upi_id', e.target.value)}
              placeholder="bbha@upi" className={`${inputCls} font-mono`} />
          </div>
          <div>
            <label className={labelCls}>Bank Name</label>
            <input type="text" value={form.bank_name} onChange={(e) => update('bank_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Account Number</label>
            <input type="text" value={form.bank_account} onChange={(e) => update('bank_account', e.target.value)}
              className={`${inputCls} font-mono`} />
          </div>
          <div>
            <label className={labelCls}>IFSC Code</label>
            <input type="text" value={form.bank_ifsc} onChange={(e) => update('bank_ifsc', e.target.value.toUpperCase())}
              className={`${inputCls} font-mono`} maxLength={11} />
          </div>
        </div>
      </section>

      {/* Preview */}
      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-800">
        <p className="font-semibold mb-1">Invoice Preview</p>
        <p><strong>{form.bbha_name}</strong></p>
        <p>{form.bbha_address}</p>
        <p>GSTIN: {form.bbha_gstin || '(not set)'} &nbsp;|&nbsp; SAC: {form.sac_code}</p>
        <p>Membership Fee: ₹{Number(form.membership_fee).toLocaleString('en-IN')} + {form.gst_rate}% GST</p>
        <p>Next Invoice No: {form.invoice_prefix}/2026/{Number(form.invoice_counter) + 1}</p>
      </div>
    </div>
  )
}
