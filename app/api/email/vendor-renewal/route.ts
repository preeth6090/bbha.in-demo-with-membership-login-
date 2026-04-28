import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { BADGE_DEFINITIONS } from '@/lib/utils/badges'
import { BadgeKey } from '@/lib/types'

interface RenewalPayload {
  vendorEmail: string
  vendorName: string
  contactPerson: string | null
  badgeKey: BadgeKey
  expiresAt: string
  renewalAmount?: number
  upiId?: string
}

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const payload: RenewalPayload = await request.json()

  const { vendorEmail, vendorName, contactPerson, badgeKey, expiresAt, renewalAmount = 2500, upiId = 'bbha@upi' } = payload
  const badge = BADGE_DEFINITIONS[badgeKey]
  const expiryFormatted = new Date(expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  // QR code via Google Charts API (UPI deep-link encoded)
  const upiLink = `upi://pay?pa=${upiId}&pn=BBHA&am=${renewalAmount}&cu=INR&tn=Badge+Renewal+${badge?.label}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`

  const portalUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portal.bbha.in'

  const { data, error } = await resend.emails.send({
    from: 'BBHA Portal <noreply@bbha.in>',
    to: vendorEmail,
    subject: `Action Required: Your BBHA "${badge?.label}" badge expires on ${expiryFormatted}`,
    html: `
<!DOCTYPE html><html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:20px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:28px 32px;text-align:center;">
    <span style="font-size:36px">${badge?.icon ?? '🏷️'}</span>
    <h1 style="margin:8px 0 4px;color:white;font-size:20px;font-weight:700;">Badge Renewal Required</h1>
    <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;">Bangalore Hotels Association</p>
  </div>

  <div style="padding:28px 32px;">
    <p style="color:#1e293b;font-size:15px;margin:0 0 16px;">
      Dear ${contactPerson ?? vendorName},
    </p>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px;">
      Your <strong>${badge?.label}</strong> badge on the BBHA Vendor Directory is expiring on
      <strong style="color:#dc2626;">${expiryFormatted}</strong>.
      Renew now to keep your listing visible to all ${''}<strong>BBHA member hotels and restaurants</strong>.
    </p>

    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#92400e;font-weight:600;">RENEWAL AMOUNT</p>
      <p style="margin:0 0 16px;font-size:28px;font-weight:700;color:#92400e;">₹${renewalAmount.toLocaleString('en-IN')}</p>
      <p style="margin:0 0 12px;font-size:13px;color:#78350f;">Scan the QR code below to pay via UPI</p>
      <img src="${qrUrl}" alt="UPI QR Code" width="160" height="160" style="border-radius:8px;border:2px solid #fde68a;" />
      <p style="margin:10px 0 0;font-size:11px;color:#a16207;font-family:monospace;">${upiId}</p>
    </div>

    <p style="color:#94a3b8;font-size:12px;margin:0 0 16px;text-align:center;">
      Or pay via the portal — your badge will be automatically extended after payment verification.
    </p>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="${portalUrl}" style="display:inline-block;background:#f59e0b;color:white;text-decoration:none;border-radius:10px;padding:12px 28px;font-weight:600;font-size:14px;">
        Pay via Portal →
      </a>
    </div>

    <div style="background:#f1f5f9;border-radius:10px;padding:16px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#475569;">What happens if I don't renew?</p>
      <ul style="margin:0;padding:0 0 0 18px;color:#64748b;font-size:13px;line-height:1.8;">
        <li>Your <strong>${badge?.label}</strong> badge will be removed from the directory</li>
        <li>Members will no longer see your offers/credentials highlighted</li>
        <li>You can re-apply at any time — the badge is reinstated within 24 hours of payment</li>
      </ul>
    </div>
  </div>

  <div style="border-top:1px solid #f1f5f9;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#94a3b8;font-size:12px;">
      © ${new Date().getFullYear()} Bangalore Hotels Association &nbsp;·&nbsp;
      <a href="https://bbha.in" style="color:#f59e0b;text-decoration:none;">bbha.in</a>
    </p>
  </div>
</div>
</body></html>
    `,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data?.id })
}
