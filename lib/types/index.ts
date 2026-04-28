export type UserRole = 'admin' | 'member'
export type PaymentMethod = 'upi' | 'neft' | 'rtgs' | 'imps' | 'cash' | 'other'
export type SubmissionStatus = 'pending' | 'verified' | 'rejected'
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'waived'
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'expired'
export type ComplianceStatus = 'green' | 'yellow' | 'red'
export type EntityType = 'Hotel' | 'Restaurant' | 'Bakery' | 'QSR' | 'Catering' | 'Bar' | 'Other'
export type DocumentType =
  | 'FSSAI'
  | 'BBMP_Trade_License'
  | 'GST_Certificate'
  | 'Fire_NOC'
  | 'Health_License'
  | 'Liquor_License'
  | 'Other'
export type NotificationType = 'info' | 'warning' | 'success' | 'error'
export type AnnouncementType = 'info' | 'warning' | 'promo' | 'alert'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  is_approved: boolean
  avatar_url: string | null
  gstin: string | null
  pan: string | null
  address: string | null
  pincode: string | null
  created_at: string
  updated_at: string
}

export interface Entity {
  id: string
  owner_id: string
  name: string
  type: EntityType
  address: string | null
  city: string
  gstin: string | null
  fssai_number: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  owner?: Profile
  memberships?: Membership[]
  documents?: Document[]
}

export interface Membership {
  id: string
  entity_id: string
  profile_id: string
  membership_number: string | null
  plan: 'annual' | 'lifetime'
  payment_status: PaymentStatus
  amount_due: number
  amount_paid: number
  due_date: string | null
  paid_date: string | null
  payment_reference: string | null
  valid_from: string | null
  valid_until: string | null
  created_at: string
  updated_at: string
  entity?: Entity
  profile?: Profile
}

export interface Document {
  id: string
  entity_id: string
  profile_id: string
  document_type: DocumentType
  custom_document_name: string | null
  document_number: string | null
  issuing_authority: string | null
  issue_date: string | null
  expiry_date: string | null
  file_url: string | null
  file_name: string | null
  verification_status: VerificationStatus
  verified_by: string | null
  verified_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  entity?: Entity
}

export interface PaymentSubmission {
  id: string
  membership_id: string
  profile_id: string
  utr_number: string
  amount_paid: number
  payment_method: PaymentMethod
  status: SubmissionStatus
  rejection_reason: string | null
  invoice_number: string | null
  submitted_at: string
  verified_at: string | null
  verified_by: string | null
  notes: string | null
  membership?: Membership
  profile?: Profile
}

export interface InvoiceSettings {
  id: string
  bbha_name: string
  bbha_gstin: string
  bbha_address: string
  bbha_phone: string
  bbha_email: string
  sac_code: string
  membership_fee: number
  gst_rate: number
  invoice_prefix: string
  invoice_counter: number
  upi_id: string
  bank_name: string
  bank_account: string
  bank_ifsc: string
  logo_url: string | null
  updated_at: string
  updated_by: string | null
}

export interface Notification {
  id: string
  profile_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  link: string | null
  created_at: string
}

export interface FeeAdjustment {
  id: string
  membership_id: string
  adjusted_by: string
  original_amount: number
  adjusted_amount: number
  reason: string
  created_at: string
  membership?: Membership
  adjuster?: Profile
}

export interface VendorCategory {
  id: string
  name: string
  icon: string
  description: string
}

export interface Vendor {
  id: string
  category_id: string
  name: string
  description: string
  contact_person: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string
  pincode: string | null
  lat: number | null
  lng: number | null
  is_empanelled: boolean
  created_at: string
  category?: VendorCategory
  badges?: VendorBadge[]
}

export type BadgeKey =
  | 'bbha_recommended'
  | 'top_rated'
  | 'verified_supplier'
  | 'new_vendor'
  | 'under_review'
  | 'bbha_member_rate'
  | 'negotiated_price'
  | 'fssai_approved'
  | 'gst_registered'
  | 'exclusive_partner'

export type BadgeSet = 'trust_quality' | 'deals_compliance'

export interface VendorBadge {
  id: string
  vendor_id: string
  badge_key: BadgeKey
  assigned_by: string
  assigned_at: string
  expires_at: string | null
}

// ── Announcements (ticker) ─────────────────────────────────────
export interface Announcement {
  id: string
  message: string
  type: AnnouncementType
  is_active: boolean
  created_by: string
  created_at: string
  expires_at: string | null
  author_name?: string
}

// ── Dashboard widget system ────────────────────────────────────
export type WidgetId =
  | 'stats'
  | 'compliance'
  | 'member_compliance'
  | 'memberships'
  | 'recent_entities'
  | 'pending_approvals'
  | 'overdue_dues'
  | 'quick_actions'
  | 'expiring_badges'

export interface WidgetConfig {
  id: WidgetId
  label: string
  visible: boolean
  order: number
  adminOnly?: boolean
  memberOnly?: boolean
}

export interface NavItem {
  label: string
  href: string
  icon: string
  adminOnly?: boolean
  badge?: number
}
