import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/shell/DashboardShell'
import { UserRole } from '@/lib/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_approved')
    .eq('id', user.id)
    .single()

  if (!profile?.is_approved && profile?.role !== 'admin') redirect('/pending')

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('is_read', false)

  return (
    <DashboardShell
      role={(profile?.role ?? 'member') as UserRole}
      fullName={profile?.full_name ?? null}
      unreadCount={unreadCount ?? 0}
    >
      {children}
    </DashboardShell>
  )
}
