'use client'

import { useState, useMemo } from 'react'
import { Announcement, AnnouncementType } from '@/lib/types'
import { X, Info, AlertTriangle, Tag, Megaphone } from 'lucide-react'

const TYPE_PRIORITY: Record<AnnouncementType, number> = {
  alert: 4, warning: 3, promo: 2, info: 1,
}

const TYPE_STYLES: Record<AnnouncementType, { bar: string; label: string; icon: React.ElementType }> = {
  info:    { bar: 'bg-blue-600',   label: 'Info',    icon: Info },
  warning: { bar: 'bg-amber-500',  label: 'Notice',  icon: AlertTriangle },
  promo:   { bar: 'bg-violet-600', label: 'Offer',   icon: Tag },
  alert:   { bar: 'bg-red-600',    label: 'Alert',   icon: Megaphone },
}

interface Props {
  announcements: Announcement[]
  isAdmin?: boolean
  onManage?: () => void
}

export function AnnouncementTicker({ announcements, isAdmin, onManage }: Props) {
  const [dismissed, setDismissed] = useState(false)

  const active = useMemo(
    () =>
      announcements
        .filter((a) => a.is_active && (!a.expires_at || new Date(a.expires_at) > new Date()))
        .sort((a, b) => TYPE_PRIORITY[b.type] - TYPE_PRIORITY[a.type]),
    [announcements],
  )

  if (!active.length || dismissed) return null

  const dominant = active[0]
  const { bar, label, icon: Icon } = TYPE_STYLES[dominant.type]
  const tickerText = active.map((a) => a.message).join('   ·   ')
  const duration = Math.max(18, active.length * 10)

  return (
    <>
      <style>{`
        @keyframes bbha-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .bbha-ticker-track {
          display: inline-block;
          white-space: nowrap;
          animation: bbha-ticker ${duration}s linear infinite;
        }
        .bbha-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className={`flex items-center gap-3 ${bar} px-4 py-2 text-white`}>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Icon className="h-3.5 w-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">{label}</span>
          <span className="h-4 w-px bg-white/30" />
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="bbha-ticker-track text-sm font-medium">
            {tickerText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {isAdmin && onManage && (
            <button
              onClick={onManage}
              className="rounded-full border border-white/40 px-2.5 py-0.5 text-[11px] font-semibold transition-colors hover:bg-white/20"
            >
              Manage
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss announcements"
            className="rounded-full p-0.5 transition-colors hover:bg-white/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  )
}
