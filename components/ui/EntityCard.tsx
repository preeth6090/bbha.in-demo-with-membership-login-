'use client'

import { Entity, UserRole } from '@/lib/types'
import { Building2, MapPin, Phone, Edit, DollarSign, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface EntityCardProps {
  entity: Entity
  role: UserRole
  onAdjustFee?: (entity: Entity) => void
}

const TYPE_COLORS: Record<string, string> = {
  Hotel:      'bg-blue-100 text-blue-700',
  Restaurant: 'bg-orange-100 text-orange-700',
  Bakery:     'bg-pink-100 text-pink-700',
  QSR:        'bg-purple-100 text-purple-700',
  Catering:   'bg-teal-100 text-teal-700',
  Bar:        'bg-rose-100 text-rose-700',
  Other:      'bg-slate-100 text-slate-700',
}

export function EntityCard({ entity, role, onAdjustFee }: EntityCardProps) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[entity.type] ?? TYPE_COLORS.Other}`}>
              {entity.type}
            </span>
            {!entity.is_active && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Inactive</span>
            )}
          </div>
          <h3 className="mt-1.5 text-base font-semibold text-slate-900">{entity.name}</h3>
        </div>
        <div className="ml-2 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <Building2 className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm text-slate-500">
        {entity.address && (
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>{entity.address}, {entity.city}</span>
          </div>
        )}
        {entity.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" />
            <span>{entity.phone}</span>
          </div>
        )}
        {entity.fssai_number && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">FSSAI:</span>
            <span className="font-mono text-xs">{entity.fssai_number}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <Link
          href={`/entities/${entity.id}`}
          className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          View Details
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>

        <div className="flex items-center gap-2">
          {/* Member: Edit their own entity */}
          {role === 'member' && (
            <Link
              href={`/entities/${entity.id}/edit`}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Link>
          )}

          {/* Admin: Fee override */}
          {role === 'admin' && onAdjustFee && (
            <button
              onClick={() => onAdjustFee(entity)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              <DollarSign className="h-3 w-3" />
              Override Fee
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
