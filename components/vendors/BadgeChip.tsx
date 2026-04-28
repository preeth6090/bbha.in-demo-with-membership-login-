import { BadgeKey, VendorBadge } from '@/lib/types'
import { BADGE_DEFINITIONS, getDaysUntilExpiry, isBadgeExpired } from '@/lib/utils/badges'
import { X, Clock } from 'lucide-react'

interface BadgeChipProps {
  badgeKey: BadgeKey
  badge?: VendorBadge        // if provided, shows expiry state
  onRemove?: () => void      // admin only
  size?: 'sm' | 'md'
}

export function BadgeChip({ badgeKey, badge, onRemove, size = 'md' }: BadgeChipProps) {
  const def = BADGE_DEFINITIONS[badgeKey]
  if (!def) return null

  const expired = badge ? isBadgeExpired(badge) : false
  const days = badge ? getDaysUntilExpiry(badge.expires_at) : null
  const expiringSoon = days !== null && days >= 0 && days <= 7

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium
      ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}
      ${expired
        ? 'bg-slate-100 border-slate-300 text-slate-400 line-through'
        : expiringSoon
        ? `${def.bg} border-orange-400 ${def.text} ring-1 ring-orange-300`
        : `${def.bg} ${def.border} ${def.text}`
      }`}
    >
      <span>{def.icon}</span>
      <span>{def.label}</span>
      {badge?.expires_at && !expired && days !== null && days <= 14 && (
        <span className={`flex items-center gap-0.5 ${expiringSoon ? 'text-orange-600' : 'text-slate-400'}`}>
          <Clock className="h-2.5 w-2.5" />
          {days === 0 ? 'today' : `${days}d`}
        </span>
      )}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="ml-0.5 rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-black/10"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  )
}
