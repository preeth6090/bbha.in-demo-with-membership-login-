'use client'

import { Bell, Menu, Search, User } from 'lucide-react'
import { UserRole } from '@/lib/types'
import { useState } from 'react'

interface HeaderProps {
  fullName: string | null
  role: UserRole
  unreadCount?: number
  onMobileMenuToggle?: () => void
}

export function Header({ fullName, role, unreadCount = 0, onMobileMenuToggle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden text-sm text-slate-500 md:block">
          Bangalore Hotels Association
          <span className="mx-2 text-slate-300">/</span>
          <span className="font-medium text-slate-800">Portal</span>
        </div>
      </div>

      {/* Right: search + notifications + avatar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSearchOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <Search className="h-4 w-4" />
        </button>

        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-red-500" />
          )}
        </button>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-slate-800 leading-none">
              {fullName ?? 'Member'}
            </p>
            <p className="text-xs capitalize text-slate-500">{role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
