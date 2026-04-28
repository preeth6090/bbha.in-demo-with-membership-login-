'use client'

import { useState, useMemo, useCallback } from 'react'
import { Vendor, VendorCategory, VendorBadge, UserRole, PaymentStatus, BadgeKey } from '@/lib/types'
import { VendorCard } from './VendorCard'
import { BadgeManager } from './BadgeManager'
import { ExpiringBadgesPanel } from './ExpiringBadgesPanel'
import { BADGE_SET_1, BADGE_SET_2, isBadgeExpiringSoon } from '@/lib/utils/badges'
import { haversineKm, PINCODE_COORDS, BANGALORE_CENTER } from '@/lib/utils/haversine'
import { exportVendorsToExcel } from '@/lib/utils/exportVendors'
import {
  Search, Plus, SlidersHorizontal, X, Store, Download,
  MapPin, Navigation, FileSpreadsheet,
} from 'lucide-react'

interface VendorSearchProps {
  vendors: Vendor[]
  badges: VendorBadge[]
  categories: VendorCategory[]
  role: UserRole
  paymentStatus: PaymentStatus
  adminId?: string
  onAdd?: () => void
  onToggleEmpanelled?: (vendor: Vendor) => void
  onDelete?: (vendor: Vendor) => void
  onBadgesUpdated?: (vendorId: string, updated: VendorBadge[]) => void
}

type SortOption = 'name_asc' | 'name_desc' | 'newest' | 'nearest'
const RADIUS_OPTIONS = [
  { label: 'Any distance', value: null },
  { label: '≤ 5 km', value: 5 },
  { label: '≤ 10 km', value: 10 },
  { label: '≤ 20 km', value: 20 },
  { label: '≤ 50 km', value: 50 },
]

export function VendorSearch({
  vendors, badges, categories, role, paymentStatus,
  adminId = '', onAdd, onToggleEmpanelled, onDelete, onBadgesUpdated,
}: VendorSearchProps) {
  // ── filter state ─────────────────────────────────────────────
  const [query, setQuery]                   = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBadges, setSelectedBadges] = useState<Set<BadgeKey>>(new Set())
  const [empanelledOnly, setEmpanelledOnly] = useState(true)
  const [sort, setSort]                     = useState<SortOption>('name_asc')
  const [showFilters, setShowFilters]       = useState(false)
  // location
  const [pincodeInput, setPincodeInput]     = useState('')
  const [pincodeLocked, setPincodeLocked]   = useState(false)
  const [radiusKm, setRadiusKm]             = useState<number | null>(null)
  const [pincodeError, setPincodeError]     = useState('')
  // badge manager
  const [managingVendor, setManagingVendor] = useState<Vendor | null>(null)

  // ── derived lookups ───────────────────────────────────────────
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  )
  const badgesByVendor = useMemo(() => {
    const map: Record<string, VendorBadge[]> = {}
    badges.forEach((b) => { (map[b.vendor_id] ??= []).push(b) })
    return map
  }, [badges])

  // resolve reference point from pincode
  const refPoint = useMemo(() => {
    if (!pincodeLocked || !pincodeInput) return BANGALORE_CENTER
    return PINCODE_COORDS[pincodeInput] ?? null
  }, [pincodeLocked, pincodeInput])

  // distance per vendor
  const distanceMap = useMemo(() => {
    if (!refPoint) return {}
    const map: Record<string, number> = {}
    vendors.forEach((v) => {
      if (v.lat && v.lng) {
        map[v.id] = haversineKm(refPoint.lat, refPoint.lng, v.lat, v.lng)
      }
    })
    return map
  }, [vendors, refPoint])

  // expiring badges for admin panel
  const expiringEntries = useMemo(() =>
    badges
      .filter((b) => isBadgeExpiringSoon(b, 7))
      .map((b) => ({ badge: b, vendor: vendors.find((v) => v.id === b.vendor_id)! }))
      .filter((e) => !!e.vendor),
    [badges, vendors]
  )

  // ── filtered + sorted list ────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return vendors
      .filter((v) => {
        if (empanelledOnly && !v.is_empanelled) return false
        if (selectedCategory && v.category_id !== selectedCategory) return false
        // badge filter — vendor must have ALL selected badges active
        if (selectedBadges.size > 0) {
          const vBadgeKeys = new Set((badgesByVendor[v.id] ?? []).map((b) => b.badge_key))
          for (const key of selectedBadges) { if (!vBadgeKeys.has(key)) return false }
        }
        // radius filter
        if (radiusKm !== null) {
          const dist = distanceMap[v.id]
          if (dist === undefined || dist > radiusKm) return false
        }
        // pincode exact filter (if entered but not using radius)
        if (pincodeInput && !radiusKm && pincodeLocked) {
          if (v.pincode !== pincodeInput) return false
        }
        // text search
        if (!q) return true
        return (
          v.name.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.contact_person?.toLowerCase().includes(q) ||
          v.address?.toLowerCase().includes(q) ||
          v.pincode?.includes(q) ||
          categoryMap[v.category_id]?.name.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (sort === 'nearest') {
          return (distanceMap[a.id] ?? 999) - (distanceMap[b.id] ?? 999)
        }
        if (sort === 'name_asc')  return a.name.localeCompare(b.name)
        if (sort === 'name_desc') return b.name.localeCompare(a.name)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [vendors, query, selectedCategory, selectedBadges, empanelledOnly, sort,
      radiusKm, pincodeInput, pincodeLocked, distanceMap, badgesByVendor, categoryMap])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    vendors.forEach((v) => { if (!empanelledOnly || v.is_empanelled) counts[v.category_id] = (counts[v.category_id] ?? 0) + 1 })
    return counts
  }, [vendors, empanelledOnly])

  function toggleBadgeFilter(key: BadgeKey) {
    setSelectedBadges((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function applyPincode() {
    if (!pincodeInput) { setPincodeLocked(false); return }
    if (!PINCODE_COORDS[pincodeInput]) {
      setPincodeError(`Pincode ${pincodeInput} not in our Bangalore index. Try a radius instead.`)
      return
    }
    setPincodeError('')
    setPincodeLocked(true)
    if (radiusKm === null) setRadiusKm(10)
    setSort('nearest')
  }

  function clearLocation() {
    setPincodeInput(''); setPincodeLocked(false); setRadiusKm(null)
    setPincodeError(''); if (sort === 'nearest') setSort('name_asc')
  }

  function clearFilters() {
    setQuery(''); setSelectedCategory(null); setSelectedBadges(new Set())
    setEmpanelledOnly(true); setSort('name_asc'); clearLocation()
  }

  const hasActiveFilters = query || selectedCategory || selectedBadges.size > 0 ||
    !empanelledOnly || sort !== 'name_asc' || pincodeLocked || radiusKm

  function handleExport() {
    exportVendorsToExcel(filtered, badges, categories)
  }

  const handleBadgesSaved = useCallback((vendor: Vendor, updated: VendorBadge[]) => {
    onBadgesUpdated?.(vendor.id, updated)
  }, [onBadgesUpdated])

  return (
    <div className="space-y-5">
      {/* Admin: expiring badges warning panel */}
      {role === 'admin' && expiringEntries.length > 0 && (
        <ExpiringBadgesPanel entries={expiringEntries} />
      )}

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors by name, service, pincode…"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
            showFilters ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-xs text-white font-bold">!</span>}
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
          title="Export visible vendors to Excel"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span className="hidden sm:inline">Export Excel</span>
        </button>

        {role === 'admin' && (
          <button
            onClick={onAdd}
            className="flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-medium text-white hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            Add Vendor
          </button>
        )}
      </div>

      {/* ── Expanded filters ──────────────────────────────────── */}
      {showFilters && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Sort */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Sort by</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              >
                <option value="name_asc">Name A–Z</option>
                <option value="name_desc">Name Z–A</option>
                <option value="newest">Newest First</option>
                <option value="nearest">Nearest First</option>
              </select>
            </div>

            {/* Pincode */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                <MapPin className="inline h-3 w-3 mr-1" />Filter by Pincode
              </label>
              <div className="flex gap-2">
                <input
                  type="text" maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => { setPincodeInput(e.target.value.replace(/\D/g, '')); setPincodeLocked(false) }}
                  onKeyDown={(e) => e.key === 'Enter' && applyPincode()}
                  placeholder="e.g. 560034"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                />
                <button
                  onClick={pincodeLocked ? clearLocation : applyPincode}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    pincodeLocked
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {pincodeLocked ? <X className="h-4 w-4" /> : 'Go'}
                </button>
              </div>
              {pincodeError && <p className="mt-1 text-xs text-red-500">{pincodeError}</p>}
              {pincodeLocked && refPoint && (
                <p className="mt-1 text-xs text-emerald-600">📍 {refPoint.area}</p>
              )}
            </div>

            {/* Radius */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                <Navigation className="inline h-3 w-3 mr-1" />Radius Filter
              </label>
              <div className="flex flex-wrap gap-1.5">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => {
                      setRadiusKm(opt.value)
                      if (opt.value !== null) setSort('nearest')
                    }}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                      radiusKm === opt.value
                        ? 'border-blue-400 bg-blue-500 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Empanelled toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
            <input type="checkbox" checked={empanelledOnly} onChange={(e) => setEmpanelledOnly(e.target.checked)} className="h-4 w-4 accent-amber-500" />
            Show empanelled vendors only
          </label>

          {/* Badge filters */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Filter by Badge</p>
            {[
              { label: 'Set 1 — Trust & Quality', defs: BADGE_SET_1 },
              { label: 'Set 2 — Deals & Compliance', defs: BADGE_SET_2 },
            ].map(({ label, defs }) => (
              <div key={label} className="mb-2">
                <p className="mb-1.5 text-xs font-medium text-slate-400">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {defs.map((def) => {
                    const active = selectedBadges.has(def.key)
                    return (
                      <button
                        key={def.key}
                        onClick={() => toggleBadgeFilter(def.key)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                          active
                            ? `${def.bg} ${def.border} ${def.text} ring-2 ring-offset-1 ring-amber-400`
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {def.icon} {def.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700">
              <X className="h-3 w-3" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Category pills ────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <CategoryPill label="All" icon="🏪" count={vendors.filter((v) => !empanelledOnly || v.is_empanelled).length} active={!selectedCategory} onClick={() => setSelectedCategory(null)} />
        {categories.map((cat) => (
          <CategoryPill key={cat.id} label={cat.name} icon={cat.icon}
            count={categoryCounts[cat.id] ?? 0}
            active={selectedCategory === cat.id}
            onClick={() => setSelectedCategory((p) => p === cat.id ? null : cat.id)}
          />
        ))}
      </div>

      {/* ── Results header ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filtered.length === 0 ? 'No vendors found' : `${filtered.length} vendor${filtered.length !== 1 ? 's' : ''}`}
          {selectedCategory && ` · ${categoryMap[selectedCategory]?.name}`}
          {pincodeLocked && refPoint && ` · near ${refPoint.area}`}
          {radiusKm && ` within ${radiusKm}km`}
          {selectedBadges.size > 0 && ` · ${selectedBadges.size} badge filter${selectedBadges.size > 1 ? 's' : ''}`}
        </p>
        {filtered.length > 0 && (
          <button onClick={handleExport} className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600">
            <Download className="h-3.5 w-3.5" />
            {filtered.length} rows
          </button>
        )}
      </div>

      {/* ── Vendor grid ───────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16">
          <Store className="h-12 w-12 text-slate-300" />
          <p className="mt-3 font-medium text-slate-500">No vendors match your filters</p>
          <button onClick={clearFilters} className="mt-2 text-sm text-amber-600 hover:text-amber-700">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              badges={badgesByVendor[vendor.id] ?? []}
              role={role}
              paymentStatus={paymentStatus}
              categoryIcon={categoryMap[vendor.category_id]?.icon}
              distanceKm={distanceMap[vendor.id] ?? null}
              onToggleEmpanelled={onToggleEmpanelled}
              onDelete={onDelete}
              onManageBadges={setManagingVendor}
            />
          ))}
        </div>
      )}

      {/* Badge manager modal */}
      {managingVendor && (
        <BadgeManager
          vendor={managingVendor}
          badges={badgesByVendor[managingVendor.id] ?? []}
          adminId={adminId}
          onClose={() => setManagingVendor(null)}
          onSave={(updated) => { handleBadgesSaved(managingVendor, updated); setManagingVendor(null) }}
        />
      )}
    </div>
  )
}

function CategoryPill({ label, icon, count, active, onClick }: { label: string; icon: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
        active ? 'border-amber-400 bg-amber-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50'
      }`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
    </button>
  )
}
