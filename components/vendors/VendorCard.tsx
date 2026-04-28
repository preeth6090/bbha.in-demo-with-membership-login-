'use client'

import { Vendor, UserRole, PaymentStatus, VendorBadge } from '@/lib/types'
import { Phone, Mail, Globe, MapPin, Lock, BadgeCheck, Trash2, Tag, Navigation } from 'lucide-react'
import { BadgeChip } from './BadgeChip'
import { isBadgeExpired } from '@/lib/utils/badges'

interface VendorCardProps {
  vendor: Vendor
  badges: VendorBadge[]
  role: UserRole
  paymentStatus: PaymentStatus
  categoryIcon?: string
  distanceKm?: number | null
  onToggleEmpanelled?: (vendor: Vendor) => void
  onDelete?: (vendor: Vendor) => void
  onManageBadges?: (vendor: Vendor) => void
}

export function VendorCard({
  vendor, badges, role, paymentStatus, categoryIcon = '🏪',
  distanceKm, onToggleEmpanelled, onDelete, onManageBadges,
}: VendorCardProps) {
  const contactUnlocked = paymentStatus === 'paid' || paymentStatus === 'waived' || role === 'admin'
  const activeBadges = badges.filter((b) => !isBadgeExpired(b))

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl">
            {categoryIcon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-sm font-semibold text-slate-900 leading-snug">{vendor.name}</h3>
              {vendor.is_empanelled && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <BadgeCheck className="h-3 w-3" /> Empanelled
                </span>
              )}
            </div>
            {vendor.contact_person && (
              <p className="mt-0.5 text-xs text-slate-500">{vendor.contact_person}</p>
            )}
          </div>
        </div>

        {/* Admin actions */}
        {role === 'admin' && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onManageBadges?.(vendor)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
              title="Manage badges"
            >
              <Tag className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onToggleEmpanelled?.(vendor)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                vendor.is_empanelled
                  ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {vendor.is_empanelled ? 'De-list' : 'Empanel'}
            </button>
            <button
              onClick={() => onDelete?.(vendor)}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Badges */}
      {activeBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-2">
          {activeBadges.map((b) => (
            <BadgeChip key={b.id} badgeKey={b.badge_key} badge={b} size="sm" />
          ))}
        </div>
      )}

      {/* Description */}
      <p className="px-5 text-xs leading-relaxed text-slate-600 line-clamp-3">{vendor.description}</p>

      {/* Location row */}
      <div className="mx-5 mt-3 flex items-center gap-3">
        {vendor.address && (
          <div className="flex items-start gap-1.5 text-xs text-slate-400 flex-1 min-w-0">
            <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <span className="truncate">{vendor.address}</span>
          </div>
        )}
        {distanceKm !== null && distanceKm !== undefined && (
          <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
            <Navigation className="h-2.5 w-2.5" />
            {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}
          </span>
        )}
      </div>

      {/* Pincode */}
      {vendor.pincode && (
        <p className="mx-5 mt-1 text-xs text-slate-400">📍 {vendor.pincode}</p>
      )}

      {/* Contact strip */}
      <div className="mt-4 border-t border-slate-100 px-5 py-3">
        {contactUnlocked ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {vendor.phone && (
              <a href={`tel:${vendor.phone}`} className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700">
                <Phone className="h-3.5 w-3.5" />{vendor.phone}
              </a>
            )}
            {vendor.email && (
              <a href={`mailto:${vendor.email}`} className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700">
                <Mail className="h-3.5 w-3.5" />{vendor.email}
              </a>
            )}
            {vendor.website && (
              <a
                href={`https://${vendor.website.replace(/^https?:\/\//, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-amber-600"
              >
                <Globe className="h-3.5 w-3.5" />{vendor.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5" />
              <span>Contact details for paid members</span>
            </div>
            <a href="/memberships" className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600">
              Pay Now
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
