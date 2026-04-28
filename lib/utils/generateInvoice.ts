import { InvoiceSettings, PaymentSubmission, Membership, Entity, Profile } from '@/lib/types'

interface InvoiceData {
  settings: InvoiceSettings
  submission: PaymentSubmission
  membership: Membership
  entity: Entity
  member: Profile
  invoiceDate: string
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const { settings, submission, entity, member, invoiceDate } = data
  const invoiceNo = submission.invoice_number ?? '—'
  const gstRate = settings.gst_rate
  const cgstRate = gstRate / 2
  const sgstRate = gstRate / 2
  const base = submission.amount_paid / (1 + gstRate / 100)
  const cgst = base * (cgstRate / 100)
  const sgst = base * (sgstRate / 100)
  const total = submission.amount_paid

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tax Invoice — ${invoiceNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; background: #fff; font-size: 12px; }
    .page { max-width: 740px; margin: 0 auto; padding: 32px; border: 1px solid #000; }
    h1 { font-size: 20px; text-align: center; letter-spacing: 2px; margin-bottom: 4px; }
    .subtitle { text-align: center; font-size: 11px; color: #444; margin-bottom: 16px; }
    .divider { border-top: 2px solid #000; margin: 12px 0; }
    .divider-thin { border-top: 1px solid #000; margin: 8px 0; }
    .flex { display: flex; justify-content: space-between; gap: 16px; }
    .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #555; margin-bottom: 4px; }
    .info-block p { line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { border: 1px solid #000; padding: 6px 8px; font-size: 11px; text-align: left; background: #f0f0f0; }
    td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
    .text-right { text-align: right; }
    .total-row td { font-weight: 700; font-size: 13px; background: #f0f0f0; }
    .footer { margin-top: 24px; font-size: 10px; color: #555; text-align: center; }
    .stamp-area { margin-top: 40px; display: flex; justify-content: space-between; }
    .stamp-box { border-top: 1px solid #000; padding-top: 6px; font-size: 10px; color: #555; width: 180px; text-align: center; }
    @media print {
      body { print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <h1>${settings.bbha_name.toUpperCase()}</h1>
  <p class="subtitle">${settings.bbha_address}${settings.bbha_phone ? ` &nbsp;|&nbsp; Tel: ${settings.bbha_phone}` : ''}</p>
  ${settings.bbha_gstin ? `<p class="subtitle">GSTIN: <strong>${settings.bbha_gstin}</strong></p>` : ''}
  <div class="divider"></div>
  <h1 style="font-size:15px;letter-spacing:3px;">TAX INVOICE</h1>
  <div class="divider"></div>

  <!-- Invoice meta + buyer -->
  <div class="flex" style="margin-bottom:12px;">
    <div class="info-block">
      <p class="section-label">Bill To</p>
      <p><strong>${entity.name}</strong></p>
      <p>${entity.type} &nbsp;|&nbsp; ${entity.city}</p>
      ${entity.address ? `<p>${entity.address}</p>` : ''}
      ${entity.gstin ? `<p>GSTIN: ${entity.gstin}</p>` : ''}
      <p>Contact: ${member.full_name ?? ''}</p>
    </div>
    <div class="info-block" style="text-align:right;">
      <p class="section-label">Invoice Details</p>
      <p><strong>Invoice No:</strong> ${invoiceNo}</p>
      <p><strong>Date:</strong> ${fmtDate(invoiceDate)}</p>
      <p><strong>Payment Ref:</strong> ${submission.utr_number}</p>
      <p><strong>Method:</strong> ${submission.payment_method.toUpperCase()}</p>
    </div>
  </div>
  <div class="divider-thin"></div>

  <!-- Line items -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Description of Service</th>
        <th>SAC Code</th>
        <th class="text-right">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>BBHA Annual Membership Fee — ${new Date(invoiceDate).getFullYear()}-${new Date(invoiceDate).getFullYear() + 1 - 2000}</td>
        <td>${settings.sac_code}</td>
        <td class="text-right">${fmt(base)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Tax summary -->
  <table style="width:50%;margin-left:auto;">
    <tr><td>Taxable Amount</td><td class="text-right">${fmt(base)}</td></tr>
    <tr><td>CGST @ ${cgstRate}%</td><td class="text-right">${fmt(cgst)}</td></tr>
    <tr><td>SGST @ ${sgstRate}%</td><td class="text-right">${fmt(sgst)}</td></tr>
    <tr class="total-row"><td>Total</td><td class="text-right">${fmt(total)}</td></tr>
  </table>

  <div class="divider-thin" style="margin-top:16px;"></div>
  <p style="font-size:11px;margin-top:8px;">
    <strong>Amount in words:</strong> ${numberToWords(Math.round(total))} Rupees Only
  </p>

  <!-- Bank / UPI -->
  <div class="divider-thin" style="margin-top:12px;"></div>
  ${settings.bank_account ? `
  <div style="margin:8px 0;font-size:11px;">
    <p class="section-label">Payment Details</p>
    <p>Bank: ${settings.bank_name} &nbsp;|&nbsp; A/C: ${settings.bank_account} &nbsp;|&nbsp; IFSC: ${settings.bank_ifsc}</p>
    ${settings.upi_id ? `<p>UPI: ${settings.upi_id}</p>` : ''}
  </div>
  ` : ''}

  <div class="stamp-area">
    <div class="stamp-box">
      Member Signature & Date<br /><br /><br />
    </div>
    <div class="stamp-box">
      For ${settings.bbha_name}<br /><br /><br />
      Authorised Signatory
    </div>
  </div>

  <div class="footer">
    <div class="divider-thin" style="margin-bottom:6px;"></div>
    This is a system-generated invoice. BBHA Membership fees are subject to 18% GST (CGST + SGST) for intrastate transactions.
    <br />Registered under GST: ${settings.bbha_gstin || 'Pending'}
  </div>
</div>

<div class="no-print" style="text-align:center;padding:16px;">
  <button onclick="window.print()"
    style="background:#f59e0b;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;font-weight:600;">
    🖨️ Print / Save as PDF
  </button>
</div>
</body>
</html>`
}

function numberToWords(n: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function below100(n: number): string {
    if (n < 20) return ones[n]
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
  }
  function below1000(n: number): string {
    if (n < 100) return below100(n)
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + below100(n % 100) : '')
  }

  if (n === 0) return 'Zero'
  if (n >= 100000) {
    return below1000(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numberToWords(n % 100000) : '')
  }
  if (n >= 1000) {
    return below1000(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + below1000(n % 1000) : '')
  }
  return below1000(n)
}

export function openInvoiceInNewTab(html: string) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
