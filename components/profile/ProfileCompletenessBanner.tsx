'use client'

import { useEffect, useState } from 'react'
import { X, AlertCircle, ChevronRight } from 'lucide-react'
import { Profile } from '@/lib/types'

const STORAGE_KEY  = 'bbha_profile_prompt'
const MAX_SHOWS    = 4
const SNOOZE_DAYS  = 30

interface StoredState {
  count: number
  snoozedUntil: string | null
}

interface MissingField {
  key: keyof Profile
  label: string
  required: boolean
}

const FIELDS: MissingField[] = [
  { key: 'full_name', label: 'Full Name',    required: true },
  { key: 'phone',     label: 'Phone',        required: true },
  { key: 'gstin',     label: 'GSTIN',        required: false },
  { key: 'pan',       label: 'PAN',          required: false },
  { key: 'address',   label: 'Address',      required: false },
  { key: 'pincode',   label: 'Pincode',      required: false },
]

interface Props {
  profile: Profile
  onEdit: () => void
}

export function ProfileCompletenessBanner({ profile, onEdit }: Props) {
  const [visible, setVisible] = useState(false)
  const [state, setState]     = useState<StoredState>({ count: 0, snoozedUntil: null })

  const missing = FIELDS.filter((f) => !profile[f.key])
  const total   = FIELDS.length
  const filled  = total - missing.length
  const pct     = Math.round((filled / total) * 100)

  useEffect(() => {
    if (missing.length === 0) return

    const raw = localStorage.getItem(STORAGE_KEY)
    const stored: StoredState = raw ? JSON.parse(raw) : { count: 0, snoozedUntil: null }

    if (stored.snoozedUntil && new Date(stored.snoozedUntil) > new Date()) return
    if (stored.count >= MAX_SHOWS) return

    const next = { ...stored, count: stored.count + 1 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setState(next)
    setVisible(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleDismiss() {
    setVisible(false)
  }

  function handleSnooze() {
    const snoozedUntil = new Date(Date.now() + SNOOZE_DAYS * 86400 * 1000).toISOString()
    const next = { count: MAX_SHOWS, snoozedUntil }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setState(next)
    setVisible(false)
  }

  if (!visible || missing.length === 0) return null

  const requiredMissing = missing.filter((f) => f.required)
  const isLastChance    = state.count >= MAX_SHOWS

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">
              Complete your profile ({pct}% done)
            </p>
            <p className="mt-0.5 text-xs text-blue-700">
              Missing:{' '}
              <span className="font-medium">
                {missing.map((f) => f.label).join(', ')}
              </span>
              {requiredMissing.length > 0 && (
                <span className="ml-1 text-red-600">
                  — {requiredMissing.map((f) => f.label).join(' & ')} required for invoice generation.
                </span>
              )}
            </p>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Complete Profile <ChevronRight className="h-3 w-3" />
              </button>
              {isLastChance ? (
                <button
                  onClick={handleSnooze}
                  className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                >
                  Remind me in {SNOOZE_DAYS} days
                </button>
              ) : (
                <span className="text-[11px] text-blue-500">
                  Shown {state.count} of {MAX_SHOWS} times
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleDismiss} className="flex-shrink-0 rounded-lg p-1 hover:bg-blue-100">
          <X className="h-4 w-4 text-blue-500" />
        </button>
      </div>
    </div>
  )
}
