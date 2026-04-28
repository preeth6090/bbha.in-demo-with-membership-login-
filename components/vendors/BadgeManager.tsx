'use client'

import { useState } from 'react'
import { Vendor, VendorBadge, BadgeKey } from '@/lib/types'
import { BADGE_SET_1, BADGE_SET_2, BADGE_DEFINITIONS, isBadgeExpired } from '@/lib/utils/badges'
import { BadgeChip } from './BadgeChip'
import { X, Tag, Plus, AlertCircle } from 'lucide-react'

interface BadgeManagerProps {
  vendor: Vendor
  badges: VendorBadge[]       // current badges for this vendor
  adminId: string
  onClose: () => void
  onSave: (updated: VendorBadge[]) => void
}

function today() { return new Date().toISOString().split('T')[0] }
function ninetyDaysLater() {
  const d = new Date(); d.setDate(d.getDate() + 90)
  return d.toISOString().split('T')[0]
}

export function BadgeManager({ vendor, badges, adminId, onClose, onSave }: BadgeManagerProps) {
  const [local, setLocal] = useState<VendorBadge[]>(badges)
  const [adding, setAdding] = useState<BadgeKey | null>(null)
  const [expiryDate, setExpiryDate] = useState(ninetyDaysLater())
  const [noExpiry, setNoExpiry] = useState(false)
  const [error, setError] = useState('')

  const activeBadges = local.filter((b) => !isBadgeExpired(b))
  const assignedKeys = new Set(local.map((b) => b.badge_key))

  function handleAdd() {
    if (!adding) return
    if (assignedKeys.has(adding)) { setError('This badge is already assigned.'); return }
    setError('')
    const newBadge: VendorBadge = {
      id: `badge-${Date.now()}`,
      vendor_id: vendor.id,
      badge_key: adding,
      assigned_by: adminId,
      assigned_at: new Date().toISOString(),
      expires_at: noExpiry ? null : new Date(expiryDate).toISOString(),
    }
    setLocal((prev) => [...prev, newBadge])
    setAdding(null)
    setExpiryDate(ninetyDaysLater())
    setNoExpiry(false)
  }

  function handleRemove(id: string) {
    setLocal((prev) => prev.filter((b) => b.id !== id))
  }

  const allSets = [
    { label: 'Set 1 — Trust & Quality', badges: BADGE_SET_1 },
    { label: 'Set 2 — Deals & Compliance', badges: BADGE_SET_2 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <Tag className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Manage Badges</h2>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{vendor.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Current badges */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Assigned Badges ({activeBadges.length})
            </p>
            {local.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No badges assigned yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {local.map((b) => (
                  <BadgeChip
                    key={b.id}
                    badgeKey={b.badge_key}
                    badge={b}
                    onRemove={() => handleRemove(b.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Assign new badge */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Add a Badge
            </p>

            {allSets.map(({ label, badges: setDefs }) => (
              <div key={label} className="mb-3">
                <p className="mb-1.5 text-xs font-medium text-slate-500">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {setDefs.map((def) => {
                    const already = assignedKeys.has(def.key)
                    const isSelected = adding === def.key
                    return (
                      <button
                        key={def.key}
                        disabled={already}
                        onClick={() => setAdding(isSelected ? null : def.key)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all
                          ${already
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                            : isSelected
                            ? `${def.bg} ${def.border} ${def.text} ring-2 ring-offset-1 ring-amber-400`
                            : `${def.bg} ${def.border} ${def.text} hover:opacity-80`
                          }`}
                      >
                        {def.icon} {def.label}
                        {already && <span className="text-slate-300"> ✓</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Expiry options — shown when a badge is selected */}
            {adding && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                <p className="text-xs font-medium text-amber-800">
                  Adding: {BADGE_DEFINITIONS[adding].icon} {BADGE_DEFINITIONS[adding].label}
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noExpiry}
                      onChange={(e) => setNoExpiry(e.target.checked)}
                      className="accent-amber-500"
                    />
                    No expiry date
                  </label>
                </div>
                {!noExpiry && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-600 whitespace-nowrap">Expires on:</label>
                    <input
                      type="date"
                      value={expiryDate}
                      min={today()}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}
                {error && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" /> {error}
                  </p>
                )}
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
                >
                  <Plus className="h-3 w-3" /> Confirm Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4 flex-shrink-0">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => { onSave(local); onClose() }}
            className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            Save Badges
          </button>
        </div>
      </div>
    </div>
  )
}
