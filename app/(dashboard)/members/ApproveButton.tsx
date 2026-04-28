'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ApproveButton({ profileId, email, name }: { profileId: string; email: string; name: string | null }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleApprove() {
    setLoading(true)
    await supabase.from('profiles').update({ is_approved: true }).eq('id', profileId)
    await fetch('/api/email/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
      {loading ? 'Approving…' : 'Approve'}
    </button>
  )
}
