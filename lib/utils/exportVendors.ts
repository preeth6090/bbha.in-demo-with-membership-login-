import * as XLSX from 'xlsx'
import { Vendor, VendorBadge, VendorCategory } from '@/lib/types'
import { BADGE_DEFINITIONS } from './badges'
import { formatDate } from './formatters'

interface ExportRow {
  'Vendor Name': string
  'Category': string
  'Description': string
  'Contact Person': string
  'Phone': string
  'Email': string
  'Website': string
  'Address': string
  'Pincode': string
  'City': string
  'Empanelled': string
  'Trust & Quality Badges': string
  'Deals & Compliance Badges': string
  'Badge Expiry Dates': string
  'Added On': string
}

export function exportVendorsToExcel(
  vendors: Vendor[],
  badges: VendorBadge[],
  categories: VendorCategory[],
  filename = 'BBHA_Vendor_Directory',
) {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  const badgesByVendor: Record<string, VendorBadge[]> = {}
  badges.forEach((b) => {
    if (!badgesByVendor[b.vendor_id]) badgesByVendor[b.vendor_id] = []
    badgesByVendor[b.vendor_id].push(b)
  })

  const rows: ExportRow[] = vendors.map((v) => {
    const vBadges = badgesByVendor[v.id] ?? []
    const set1 = vBadges
      .filter((b) => BADGE_DEFINITIONS[b.badge_key]?.set === 'trust_quality')
      .map((b) => BADGE_DEFINITIONS[b.badge_key]?.label)
      .join(', ')
    const set2 = vBadges
      .filter((b) => BADGE_DEFINITIONS[b.badge_key]?.set === 'deals_compliance')
      .map((b) => BADGE_DEFINITIONS[b.badge_key]?.label)
      .join(', ')
    const expiries = vBadges
      .filter((b) => b.expires_at)
      .map((b) => `${BADGE_DEFINITIONS[b.badge_key]?.label}: ${formatDate(b.expires_at)}`)
      .join('; ')

    return {
      'Vendor Name': v.name,
      'Category': categoryMap[v.category_id] ?? '',
      'Description': v.description ?? '',
      'Contact Person': v.contact_person ?? '',
      'Phone': v.phone ?? '',
      'Email': v.email ?? '',
      'Website': v.website ?? '',
      'Address': v.address ?? '',
      'Pincode': v.pincode ?? '',
      'City': v.city,
      'Empanelled': v.is_empanelled ? 'Yes' : 'No',
      'Trust & Quality Badges': set1,
      'Deals & Compliance Badges': set2,
      'Badge Expiry Dates': expiries,
      'Added On': formatDate(v.created_at),
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 30 }, { wch: 25 }, { wch: 50 }, { wch: 20 },
    { wch: 18 }, { wch: 28 }, { wch: 25 }, { wch: 35 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 35 },
    { wch: 35 }, { wch: 40 }, { wch: 14 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Vendors')

  // Meta sheet
  const meta = XLSX.utils.aoa_to_sheet([
    ['BBHA Vendor Directory Export'],
    [`Generated: ${new Date().toLocaleString('en-IN')}`],
    [`Total Vendors: ${vendors.length}`],
    [`Empanelled: ${vendors.filter((v) => v.is_empanelled).length}`],
    [''],
    ['This document is confidential and for BBHA members only.'],
  ])
  XLSX.utils.book_append_sheet(wb, meta, 'Info')

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}
