'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  FileText,
  CreditCard,
  Users,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Hotel,
} from 'lucide-react'
import { UserRole } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  role: UserRole
  unreadCount?: number
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { label: 'My Entities', href: '/entities', icon: Building2, adminOnly: false },
  { label: 'Compliance Vault', href: '/documents', icon: FileText, adminOnly: false },
  { label: 'Membership & Dues', href: '/memberships', icon: CreditCard, adminOnly: false },
  { label: 'All Members', href: '/members', icon: Users, adminOnly: true },
  { label: 'Settings', href: '/settings', icon: Settings, adminOnly: false },
]

export function Sidebar({ role, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin')

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
          <Hotel className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-white">BBHA</p>
          <p className="text-xs text-slate-400">Member Portal</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-6 py-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          role === 'admin'
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {role === 'admin' ? '★ Admin' : 'Member'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </span>
              {isActive && <ChevronRight className="h-3 w-3" />}
            </Link>
          )
        })}

        {/* Notifications link */}
        <Link
          href="/notifications"
          className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            pathname === '/notifications'
              ? 'bg-amber-500 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-3">
            <Bell className="h-4 w-4 flex-shrink-0" />
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </nav>

      {/* Sign out */}
      <div className="border-t border-slate-700 p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
