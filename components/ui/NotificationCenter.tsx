'use client'

import { Notification, NotificationType } from '@/lib/types'
import { Bell, CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

const TYPE_CONFIG: Record<NotificationType, { Icon: React.ElementType; className: string }> = {
  info:    { Icon: Info,         className: 'text-blue-500 bg-blue-50' },
  success: { Icon: CheckCircle2, className: 'text-emerald-500 bg-emerald-50' },
  warning: { Icon: AlertCircle,  className: 'text-amber-500 bg-amber-50' },
  error:   { Icon: XCircle,      className: 'text-red-500 bg-red-50' },
}

interface NotificationCenterProps {
  notifications: Notification[]
}

export function NotificationCenter({ notifications: initial }: NotificationCenterProps) {
  const [items, setItems] = useState(initial)
  const supabase = createClient()

  async function markRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  async function dismiss(id: string) {
    await supabase.from('notifications').delete().eq('id', id)
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  async function markAllRead() {
    const ids = items.filter((n) => !n.is_read).map((n) => n.id)
    if (ids.length === 0) return
    await supabase.from('notifications').update({ is_read: true }).in('id', ids)
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const unread = items.filter((n) => !n.is_read).length

  return (
    <div className="w-full max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-700" />
          <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
          {unread > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-amber-600 hover:text-amber-700"
          >
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No notifications</p>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const { Icon, className } = TYPE_CONFIG[n.type]
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                  n.is_read ? 'border-slate-100 bg-white opacity-60' : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${className}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id) }}
                  className="flex-shrink-0 rounded p-0.5 text-slate-300 hover:text-slate-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
