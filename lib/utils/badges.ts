import { BadgeKey, BadgeSet, VendorBadge } from '@/lib/types'

export interface BadgeDefinition {
  key: BadgeKey
  label: string
  icon: string
  set: BadgeSet
  setLabel: string
  bg: string
  border: string
  text: string
  dot: string
}

export const BADGE_DEFINITIONS: Record<BadgeKey, BadgeDefinition> = {
  // ── Set 1: Trust & Quality ─────────────────────────────────
  bbha_recommended: {
    key: 'bbha_recommended', label: 'BBHA Recommended', icon: '⭐',
    set: 'trust_quality', setLabel: 'Trust & Quality',
    bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', dot: 'bg-amber-500',
  },
  top_rated: {
    key: 'top_rated', label: 'Top Rated', icon: '🏆',
    set: 'trust_quality', setLabel: 'Trust & Quality',
    bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', dot: 'bg-yellow-500',
  },
  verified_supplier: {
    key: 'verified_supplier', label: 'Verified Supplier', icon: '✅',
    set: 'trust_quality', setLabel: 'Trust & Quality',
    bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-500',
  },
  new_vendor: {
    key: 'new_vendor', label: 'New Vendor', icon: '🆕',
    set: 'trust_quality', setLabel: 'Trust & Quality',
    bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', dot: 'bg-blue-500',
  },
  under_review: {
    key: 'under_review', label: 'Under Review', icon: '⚠️',
    set: 'trust_quality', setLabel: 'Trust & Quality',
    bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', dot: 'bg-orange-400',
  },

  // ── Set 2: Deals & Compliance ──────────────────────────────
  bbha_member_rate: {
    key: 'bbha_member_rate', label: 'BBHA Member Rate', icon: '🏷️',
    set: 'deals_compliance', setLabel: 'Deals & Compliance',
    bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', dot: 'bg-purple-500',
  },
  negotiated_price: {
    key: 'negotiated_price', label: 'Negotiated Price', icon: '💰',
    set: 'deals_compliance', setLabel: 'Deals & Compliance',
    bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', dot: 'bg-green-500',
  },
  fssai_approved: {
    key: 'fssai_approved', label: 'FSSAI Approved', icon: '🛡️',
    set: 'deals_compliance', setLabel: 'Deals & Compliance',
    bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-800', dot: 'bg-teal-500',
  },
  gst_registered: {
    key: 'gst_registered', label: 'GST Registered', icon: '📋',
    set: 'deals_compliance', setLabel: 'Deals & Compliance',
    bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700', dot: 'bg-slate-500',
  },
  exclusive_partner: {
    key: 'exclusive_partner', label: 'Exclusive Partner', icon: '🤝',
    set: 'deals_compliance', setLabel: 'Deals & Compliance',
    bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-800', dot: 'bg-rose-500',
  },
}

export const BADGE_SET_1 = Object.values(BADGE_DEFINITIONS).filter((b) => b.set === 'trust_quality')
export const BADGE_SET_2 = Object.values(BADGE_DEFINITIONS).filter((b) => b.set === 'deals_compliance')

export function getDaysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const exp = new Date(expiresAt); exp.setHours(0, 0, 0, 0)
  return Math.floor((exp.getTime() - today.getTime()) / 86_400_000)
}

export function isBadgeExpired(badge: VendorBadge): boolean {
  if (!badge.expires_at) return false
  return new Date(badge.expires_at) < new Date()
}

export function isBadgeExpiringSoon(badge: VendorBadge, withinDays = 7): boolean {
  if (!badge.expires_at) return false
  const days = getDaysUntilExpiry(badge.expires_at)
  return days !== null && days >= 0 && days <= withinDays
}
