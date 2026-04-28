import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const { email, name } = await request.json()

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const { data, error } = await resend.emails.send({
    from: 'BBHA Portal <noreply@bbha.in>',
    to: email,
    subject: 'Welcome to BBHA — Your Membership is Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center;">
            <div style="width: 56px; height: 56px; background: white; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
              <span style="font-size: 28px;">🏨</span>
            </div>
            <h1 style="margin: 0; color: white; font-size: 22px; font-weight: 700;">Membership Approved!</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Bangalore Hotels Association</p>
          </div>

          <div style="padding: 32px;">
            <p style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">
              Dear ${name ?? 'Member'},
            </p>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              We're thrilled to welcome you to the <strong>Bangalore Hotels Association</strong>!
              Your membership application has been reviewed and approved.
            </p>

            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your Next Steps</h3>
              <ol style="margin: 0; padding: 0 0 0 20px; color: #64748b; font-size: 14px; line-height: 2;">
                <li>Sign in to your member portal</li>
                <li>Complete your membership payment</li>
                <li>Upload your statutory documents</li>
                <li>Access all member benefits</li>
              </ol>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://portal.bbha.in'}/login"
              style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; border-radius: 10px; padding: 14px 28px; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
              Access Your Portal →
            </a>

            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
              If you have any questions, reply to this email or call us at +91 80 2345 0000.
            </p>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              © ${new Date().getFullYear()} Bangalore Hotels Association. All rights reserved.<br />
              <a href="https://bbha.in" style="color: #f59e0b; text-decoration: none;">bbha.in</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  })

  if (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data?.id })
}
