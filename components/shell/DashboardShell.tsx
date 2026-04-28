'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { UserRole } from '@/lib/types'

interface DashboardShellProps {
  children: React.ReactNode
  role: UserRole
  fullName: string | null
  unreadCount?: number
}

export function DashboardShell({ children, role, fullName, unreadCount = 0 }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 flex-shrink-0 transition-transform duration-300 md:static md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar role={role} unreadCount={unreadCount} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          fullName={fullName}
          role={role}
          unreadCount={unreadCount}
          onMobileMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
