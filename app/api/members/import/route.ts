import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateMembershipNumber } from '@/lib/utils/formatters'

interface ImportRow {
  email: string
  full_name: string
  phone: string
  entity_name: string
  entity_type: string
  gstin: string
  fssai_number: string
  address: string
}

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] ?? '' }), {} as ImportRow)
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const text = await file.text()
  const rows = parseCSV(text)

  let success = 0
  const errors: string[] = []

  for (const row of rows) {
    if (!row.email) { errors.push(`Row missing email: ${JSON.stringify(row)}`); continue }

    try {
      // Create auth user with a temp password (member must reset)
      const tempPassword = `BBHA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: row.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: row.full_name, phone: row.phone, role: 'member' },
      })

      if (authError || !authData.user) {
        errors.push(`${row.email}: ${authError?.message ?? 'Unknown error'}`)
        continue
      }

      // Approve profile
      await supabase.from('profiles').update({
        full_name: row.full_name,
        phone: row.phone,
        is_approved: true,
      }).eq('id', authData.user.id)

      // Create entity
      const { data: entity } = await supabase.from('entities').insert({
        owner_id: authData.user.id,
        name: row.entity_name || row.full_name + "'s Business",
        type: row.entity_type || 'Other',
        gstin: row.gstin || null,
        fssai_number: row.fssai_number || null,
        address: row.address || null,
      }).select('id').single()

      // Create membership
      if (entity) {
        const now = new Date()
        const nextYear = new Date(now)
        nextYear.setFullYear(now.getFullYear() + 1)
        await supabase.from('memberships').insert({
          entity_id: entity.id,
          profile_id: authData.user.id,
          membership_number: generateMembershipNumber(),
          plan: 'annual',
          payment_status: 'pending',
          amount_due: 5000,
          valid_from: now.toISOString().split('T')[0],
          valid_until: nextYear.toISOString().split('T')[0],
          due_date: now.toISOString().split('T')[0],
        })
      }

      // Send welcome email
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: row.email, name: row.full_name }),
      })

      success++
    } catch (err) {
      errors.push(`${row.email}: Unexpected error`)
    }
  }

  return NextResponse.json({ success, failed: errors.length, errors })
}
