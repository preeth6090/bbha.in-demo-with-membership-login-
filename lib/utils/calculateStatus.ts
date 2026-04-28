import { ComplianceStatus } from '@/lib/types'

/**
 * Returns compliance color based on 2026 BBMP/FSSAI penalty rules:
 * - Red: expired or expiring within 30 days (immediate penalty risk)
 * - Yellow: expiring within 90 days (renewal warning)
 * - Green: valid for 90+ days
 */
export function calculateStatus(expiryDate: string | null): ComplianceStatus {
  if (!expiryDate) return 'red'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)

  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 30) return 'red'
  if (daysUntilExpiry < 90) return 'yellow'
  return 'green'
}

export const STATUS_CONFIG: Record<ComplianceStatus, { label: string; color: string; bg: string; border: string }> = {
  green: {
    label: 'Valid',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  yellow: {
    label: 'Expiring Soon',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  red: {
    label: 'Expired / Critical',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
}

export function daysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
