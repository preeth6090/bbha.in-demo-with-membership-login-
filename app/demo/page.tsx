'use client'

import { useState } from 'react'
import {
  Building2, FileText, CreditCard, Users, CheckCircle2,
  AlertTriangle, UserCheck, RefreshCw, Calendar, Hash,
  LayoutDashboard, Bell, LogOut, ChevronRight, Hotel, Store,
  Settings2, Megaphone,
} from 'lucide-react'

import { Header } from '@/components/shell/Header'
import { EntityCard } from '@/components/ui/EntityCard'
import { PaymentBadge } from '@/components/ui/PaymentBadge'
import { ContentGuard } from '@/components/ui/ContentGuard'
import { NotificationCenter } from '@/components/ui/NotificationCenter'
import { StatutoryTable } from '@/components/compliance/StatutoryTable'
import { CSVImporter } from '@/components/admin/CSVImporter'
import { FeeAdjustmentModal } from '@/components/admin/FeeAdjustmentModal'
import { InvoiceSettings as InvoiceSettingsPanel } from '@/components/admin/InvoiceSettings'
import { PaymentReports } from '@/components/admin/PaymentReports'
import { PaymentModal } from '@/components/payments/PaymentModal'
import { UTRVerificationPanel } from '@/components/payments/UTRVerificationPanel'
import { ProfileCompletenessBanner } from '@/components/profile/ProfileCompletenessBanner'
import { VendorSearch } from '@/components/vendors/VendorSearch'
import { AnnouncementTicker } from '@/components/dashboard/AnnouncementTicker'
import { AnnouncementManager } from '@/components/dashboard/AnnouncementManager'
import { StatDetailDrawer } from '@/components/dashboard/StatDetailDrawer'
import type { StatDrawerType } from '@/components/dashboard/StatDetailDrawer'
import { WidgetCustomizer } from '@/components/dashboard/WidgetCustomizer'

import {
  MOCK_ENTITIES, MOCK_DOCUMENTS, MOCK_MEMBERSHIPS, MOCK_NOTIFICATIONS,
  MOCK_PENDING_MEMBERS, MOCK_ADMIN, MOCK_MEMBER,
  MOCK_VENDORS, MOCK_VENDOR_CATEGORIES, MOCK_VENDOR_BADGES, MOCK_ANNOUNCEMENTS,
  MOCK_PAYMENT_SUBMISSIONS, MOCK_INVOICE_SETTINGS,
} from '@/lib/mock-data'
import {
  Entity, Membership, UserRole, Vendor, VendorBadge,
  Announcement, AnnouncementType, WidgetConfig, PaymentSubmission, InvoiceSettings,
} from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

// ─── Widget config defaults ───────────────────────────────────
const DEFAULT_ADMIN_WIDGETS: WidgetConfig[] = [
  { id: 'stats',             label: 'Member Statistics',    visible: true,  order: 0, adminOnly: true },
  { id: 'member_compliance', label: 'Compliance Health',    visible: true,  order: 1, adminOnly: true },
  { id: 'pending_approvals', label: 'Pending Approvals',    visible: true,  order: 2, adminOnly: true },
  { id: 'overdue_dues',      label: 'Overdue Dues',         visible: true,  order: 3, adminOnly: true },
  { id: 'recent_entities',   label: 'Recent Entities',      visible: true,  order: 4, adminOnly: true },
  { id: 'expiring_badges',   label: 'Expiring Badges',      visible: true,  order: 5, adminOnly: true },
]

const DEFAULT_MEMBER_WIDGETS: WidgetConfig[] = [
  { id: 'stats',         label: 'My Overview',       visible: true, order: 0 },
  { id: 'memberships',   label: 'My Memberships',    visible: true, order: 1, memberOnly: true },
  { id: 'compliance',    label: 'Compliance Status', visible: true, order: 2 },
  { id: 'quick_actions', label: 'Quick Actions',     visible: true, order: 3 },
]

type DemoView = 'dashboard' | 'entities' | 'documents' | 'memberships' | 'members' | 'notifications' | 'vendors' | 'payments'

export default function DemoPage() {
  const [role, setRole]     = useState<UserRole>('member')
  const [view, setView]     = useState<DemoView>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState<{ entity: Entity; membership: Membership } | null>(null)

  // Announcement state (portal-wide)
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS)
  const [announceMgrOpen, setAnnounceMgrOpen] = useState(false)

  // Per-role widget configs
  const [adminWidgets, setAdminWidgets] = useState<WidgetConfig[]>(DEFAULT_ADMIN_WIDGETS)
  const [memberWidgets, setMemberWidgets] = useState<WidgetConfig[]>(DEFAULT_MEMBER_WIDGETS)

  const user = role === 'admin' ? MOCK_ADMIN : MOCK_MEMBER
  const isAdmin = role === 'admin'

  function handleNavClick(href: string) {
    const map: Record<string, DemoView> = {
      '/dashboard': 'dashboard', '/entities': 'entities', '/documents': 'documents',
      '/memberships': 'memberships', '/members': 'members', '/notifications': 'notifications',
      '/vendors': 'vendors', '/payments': 'payments',
    }
    setView(map[href] ?? 'dashboard')
    setSidebarOpen(false)
  }

  function handleAddAnnouncement(message: string, type: AnnouncementType, expiresAt: string | null) {
    const next: Announcement = {
      id: `ann-${Date.now()}`,
      message,
      type,
      is_active: true,
      created_by: MOCK_ADMIN.id,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      author_name: MOCK_ADMIN.full_name ?? 'Admin',
    }
    setAnnouncements((prev) => [next, ...prev])
  }

  function handleToggleAnnouncement(id: string) {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: !a.is_active } : a)))
  }

  function handleDeleteAnnouncement(id: string) {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Role switcher pill */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-xl">
          <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Viewing as:</span>
          <button
            onClick={() => { setRole('member'); setView('dashboard') }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${role === 'member' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >Member</button>
          <button
            onClick={() => { setRole('admin'); setView('dashboard') }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${role === 'admin' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >Admin</button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 flex-shrink-0 transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <DemoSidebar role={role} currentView={view} onNavigate={handleNavClick} />
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          fullName={user.full_name}
          role={role}
          unreadCount={MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length}
          onMobileMenuToggle={() => setSidebarOpen((v) => !v)}
        />

        {/* Announcement ticker — visible on all pages */}
        <AnnouncementTicker
          announcements={announcements}
          isAdmin={isAdmin}
          onManage={() => setAnnounceMgrOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 pb-20">
          {view === 'dashboard' && (
            <DemoDashboard
              role={role}
              widgets={isAdmin ? adminWidgets : memberWidgets}
              onChangeWidgets={isAdmin ? setAdminWidgets : setMemberWidgets}
              announcements={announcements}
              onOpenAnnouncementManager={() => setAnnounceMgrOpen(true)}
            />
          )}
          {view === 'entities'      && <DemoEntities role={role} onAdjustFee={(e, m) => setAdjustTarget({ entity: e, membership: m })} />}
          {view === 'documents'     && <DemoDocuments role={role} />}
          {view === 'memberships'   && <DemoMemberships role={role} />}
          {view === 'members'       && isAdmin && <DemoMembers />}
          {view === 'notifications' && <DemoNotifications />}
          {view === 'vendors'       && <DemoVendors role={role} />}
          {view === 'payments'      && <DemoPayments role={role} />}
        </main>
      </div>

      {/* Modals */}
      {announceMgrOpen && (
        <AnnouncementManager
          announcements={announcements}
          onAdd={handleAddAnnouncement}
          onToggle={handleToggleAnnouncement}
          onDelete={handleDeleteAnnouncement}
          onClose={() => setAnnounceMgrOpen(false)}
        />
      )}
      {adjustTarget && (
        <FeeAdjustmentModal
          membership={adjustTarget.membership}
          adminId={MOCK_ADMIN.id}
          onClose={() => setAdjustTarget(null)}
          onSuccess={() => setAdjustTarget(null)}
        />
      )}
    </div>
  )
}

// ─── Demo Sidebar ─────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard',        view: 'dashboard'    as DemoView, icon: LayoutDashboard, adminOnly: false },
  { label: 'My Entities',      view: 'entities'     as DemoView, icon: Building2,       adminOnly: false },
  { label: 'Compliance Vault', view: 'documents'    as DemoView, icon: FileText,        adminOnly: false },
  { label: 'Membership & Dues',view: 'memberships'  as DemoView, icon: CreditCard,      adminOnly: false },
  { label: 'Payments',         view: 'payments'     as DemoView, icon: Hash,            adminOnly: false },
  { label: 'Vendor Directory', view: 'vendors'      as DemoView, icon: Store,           adminOnly: false },
  { label: 'All Members',      view: 'members'      as DemoView, icon: Users,           adminOnly: true },
]

const VIEW_HREF: Record<DemoView, string> = {
  dashboard: '/dashboard', entities: '/entities', documents: '/documents',
  memberships: '/memberships', members: '/members', notifications: '/notifications',
  vendors: '/vendors', payments: '/payments',
}

function DemoSidebar({ role, currentView, onNavigate }: { role: UserRole; currentView: DemoView; onNavigate: (href: string) => void }) {
  const items = NAV_ITEMS.filter((i) => !i.adminOnly || role === 'admin')
  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
          <Hotel className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">BBHA</p>
          <p className="text-xs text-slate-400">Member Portal</p>
        </div>
      </div>
      <div className="px-6 py-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {role === 'admin' ? '★ Admin' : 'Member'}
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = currentView === item.view
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(VIEW_HREF[item.view])}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{item.label}</span>
              {active && <ChevronRight className="h-3 w-3" />}
            </button>
          )
        })}
        <button
          onClick={() => onNavigate('/notifications')}
          className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${currentView === 'notifications' ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
        >
          <span className="flex items-center gap-3"><Bell className="h-4 w-4" />Notifications</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">2</span>
        </button>
      </nav>
      <div className="border-t border-slate-700 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400">
          <LogOut className="h-4 w-4" />
          <span className="text-xs italic">(demo — no sign out)</span>
        </div>
      </div>
    </aside>
  )
}

// ─── Dashboard View ───────────────────────────────────────────
function DemoDashboard({
  role,
  widgets,
  onChangeWidgets,
  announcements,
  onOpenAnnouncementManager,
}: {
  role: UserRole
  widgets: WidgetConfig[]
  onChangeWidgets: (w: WidgetConfig[]) => void
  announcements: Announcement[]
  onOpenAnnouncementManager: () => void
}) {
  const isAdmin = role === 'admin'
  const [customizerOpen, setCustOpen] = useState(false)
  const [drawer, setDrawer] = useState<StatDrawerType | null>(null)

  const visible = [...widgets].filter((w) => w.visible).sort((a, b) => a.order - b.order)
  const defaults = isAdmin ? DEFAULT_ADMIN_WIDGETS : DEFAULT_MEMBER_WIDGETS
  const activeCount = announcements.filter(
    (a) => a.is_active && (!a.expires_at || new Date(a.expires_at) > new Date()),
  ).length

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'Admin Dashboard' : 'Welcome back, Rajan'}
          </h1>
          <p className="mt-1 text-slate-500">
            {isAdmin
              ? 'Manage members, approvals, and compliance across all entities.'
              : 'Your BBHA membership overview at a glance.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={onOpenAnnouncementManager}
              className="relative flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
            >
              <Megaphone className="h-4 w-4" />
              Ticker
              {activeCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setCustOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <Settings2 className="h-4 w-4" />
            Customise
          </button>
        </div>
      </div>

      {/* Profile completeness banner — members only */}
      {!isAdmin && (
        <ProfileCompletenessBanner
          profile={{
            id: MOCK_MEMBER.id, email: MOCK_MEMBER.email,
            full_name: MOCK_MEMBER.full_name, phone: null,
            role: MOCK_MEMBER.role, is_approved: MOCK_MEMBER.is_approved,
            avatar_url: null, gstin: null, pan: null, address: null, pincode: null,
            created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z',
          }}
          onEdit={() => {}}
        />
      )}

      {/* Widget renderer */}
      {visible.map((w) => {
        switch (w.id) {

          case 'stats':
            return (
              <div key="stats" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {isAdmin ? (
                  <>
                    <StatCard label="Total Members"      value="7"  icon={Users}        color="blue"   onClick={() => setDrawer('entities')} />
                    <StatCard label="Active (Paid)"      value="3"  icon={CheckCircle2} color="green"  onClick={() => setDrawer('overdue')} />
                    <StatCard label="Dues Not Paid"      value="2"  icon={CreditCard}   color="red"    onClick={() => setDrawer('overdue')} />
                    <StatCard label="Compliance Alerts"  value="4"  icon={AlertTriangle} color="amber" onClick={() => setDrawer('doc_alerts')} />
                  </>
                ) : (
                  <>
                    <StatCard label="My Entities"       value="1"      icon={Building2}    color="blue"   onClick={() => setDrawer('entities')} />
                    <StatCard label="Document Alerts"   value="2"      icon={FileText}     color="amber"  onClick={() => setDrawer('doc_alerts')} />
                    <StatCard label="Memberships"       value="1"      icon={CreditCard}   color="green"  onClick={() => setDrawer('memberships')} />
                    <StatCard label="Membership Status" value="Active" icon={CheckCircle2} color="green"  onClick={() => setDrawer('membership_status')} />
                  </>
                )}
              </div>
            )

          case 'member_compliance':
            return (
              <div key="member_compliance" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />Compliance Health Summary
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Fully Compliant',    value: 3, color: 'emerald', sub: 'All docs valid' },
                    { label: 'Expiring (30 days)', value: 2, color: 'amber',   sub: 'Action needed soon' },
                    { label: 'Expired / Critical', value: 2, color: 'red',     sub: 'Inspect risk' },
                  ].map(({ label, value, color, sub }) => (
                    <div key={label} className={`rounded-xl border border-${color}-200 bg-${color}-50 p-4`}>
                      <p className={`text-2xl font-extrabold text-${color}-700`}>{value}</p>
                      <p className={`text-xs font-semibold text-${color}-800`}>{label}</p>
                      <p className={`mt-0.5 text-[11px] text-${color}-600`}>{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )

          case 'compliance':
            return (
              <div key="compliance" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <FileText className="h-5 w-5 text-amber-500" />Compliance Status
                </h2>
                <div className="space-y-2">
                  {[
                    { label: 'Valid',             color: 'emerald', doc: 'FSSAI' },
                    { label: 'Valid',             color: 'emerald', doc: 'BBMP Trade License' },
                    { label: 'Expiring Soon',     color: 'amber',   doc: 'Fire NOC' },
                    { label: 'Expired / Critical',color: 'red',     doc: 'GST Certificate' },
                  ].map(({ label, color, doc }) => (
                    <div
                      key={doc}
                      className={`flex items-center justify-between rounded-lg border border-${color}-200 bg-${color}-50 px-3 py-2`}
                    >
                      <span className={`text-xs font-medium text-${color}-700`}>{label}</span>
                      <span className="text-xs text-slate-500">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )

          case 'memberships':
            return (
              <div key="memberships" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <CreditCard className="h-5 w-5 text-amber-500" />My Memberships
                </h2>
                <button
                  onClick={() => setDrawer('memberships')}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">Annual Membership</p>
                    <p className="text-xs text-slate-500">Valid until: 31 Mar 2025</p>
                  </div>
                  <PaymentBadge status="paid" size="sm" />
                </button>
              </div>
            )

          case 'recent_entities':
            return (
              <div key="recent_entities" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Building2 className="h-5 w-5 text-amber-500" />Recent Entities
                </h2>
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="text-xs text-slate-500">
                    <tr>
                      <th className="pb-2 text-left font-semibold">Name</th>
                      <th className="pb-2 text-left font-semibold">Type</th>
                      <th className="pb-2 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_ENTITIES.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="py-2 font-medium text-slate-800">{e.name}</td>
                        <td className="py-2 text-slate-500">{e.type}</td>
                        <td className="py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {e.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          case 'pending_approvals':
            return (
              <div key="pending_approvals" className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <button
                  onClick={() => setDrawer('pending_approvals')}
                  className="mb-3 flex w-full items-center justify-between"
                >
                  <h2 className="flex items-center gap-2 text-base font-semibold text-amber-900">
                    <Users className="h-5 w-5" />Pending Approvals
                  </h2>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    {MOCK_PENDING_MEMBERS.length}
                  </span>
                </button>
                <div className="space-y-2">
                  {MOCK_PENDING_MEMBERS.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{m.full_name}</p>
                        <p className="text-xs text-slate-500">{m.email}</p>
                      </div>
                      <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
                        <UserCheck className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )

          case 'overdue_dues':
            return (
              <div key="overdue_dues" className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
                <button
                  onClick={() => setDrawer('overdue')}
                  className="mb-3 flex w-full items-center justify-between"
                >
                  <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <AlertTriangle className="h-5 w-5 text-red-500" />Overdue Dues
                  </h2>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {MOCK_MEMBERSHIPS.filter((m) => m.payment_status === 'overdue').length}
                  </span>
                </button>
                {MOCK_MEMBERSHIPS.filter((m) => m.payment_status === 'overdue').map((m) => (
                  <div key={m.id} className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800">Spice Garden QSR</p>
                      <span className="text-sm font-bold text-red-700">{formatCurrency(m.amount_due)}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">Due: {formatDate(m.due_date)}</p>
                  </div>
                ))}
              </div>
            )

          case 'expiring_badges':
            return (
              <div key="expiring_badges" className="rounded-xl border border-orange-200 bg-orange-50 p-5">
                <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-orange-900">
                  <AlertTriangle className="h-5 w-5" />Vendor Badges Expiring Soon (≤ 7 days)
                </h2>
                <p className="text-sm text-orange-800">
                  4 badges across 3 vendors expire within the next 7 days. Visit the{' '}
                  <strong>Vendor Directory</strong> to send renewal emails.
                </p>
              </div>
            )

          case 'quick_actions':
            return (
              <div key="quick_actions" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Upload Document', icon: FileText,   color: 'text-blue-600 bg-blue-50' },
                    { label: 'Pay Dues',         icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
                    { label: 'View Vendors',     icon: Store,      color: 'text-violet-600 bg-violet-50' },
                  ].map(({ label, icon: Icon, color }) => (
                    <button
                      key={label}
                      className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50"
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-700">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )

          default:
            return null
        }
      })}

      {customizerOpen && (
        <WidgetCustomizer
          widgets={widgets}
          defaultWidgets={defaults}
          onChange={onChangeWidgets}
          onClose={() => setCustOpen(false)}
        />
      )}
      <StatDetailDrawer type={drawer} role={role} onClose={() => setDrawer(null)} />
    </div>
  )
}

// ─── Entities View ────────────────────────────────────────────
function DemoEntities({ role, onAdjustFee }: { role: UserRole; onAdjustFee: (e: Entity, m: Membership) => void }) {
  const entities = role === 'admin' ? MOCK_ENTITIES : MOCK_ENTITIES.slice(0, 1)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{role === 'admin' ? 'All Entities' : 'My Entities'}</h1>
          <p className="mt-1 text-sm text-slate-500">{entities.length} establishment{entities.length !== 1 ? 's' : ''} registered</p>
        </div>
        {role === 'member' && (
          <button className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600">
            + Add Entity
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entities.map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            role={role}
            onAdjustFee={(e) => onAdjustFee(e, MOCK_MEMBERSHIPS[0])}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Documents View ───────────────────────────────────────────
function DemoDocuments({ role }: { role: UserRole }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compliance Vault</h1>
        <p className="mt-1 text-sm text-slate-500">
          {role === 'admin'
            ? 'Verify and manage statutory documents across all members.'
            : 'Manage your business licenses and statutory documents.'}
        </p>
      </div>
      <StatutoryTable
        documents={MOCK_DOCUMENTS}
        entityId="e1"
        profileId="member-1"
        role={role}
        onRefresh={() => {}}
      />
    </div>
  )
}

// ─── Memberships View ─────────────────────────────────────────
function DemoMemberships({ role }: { role: UserRole }) {
  const memberships = role === 'admin' ? MOCK_MEMBERSHIPS : MOCK_MEMBERSHIPS.slice(0, 1)
  const entityNames: Record<string, string> = { e1: 'The Grand Bangalore', e2: 'Spice Garden QSR', e3: 'Namma Bakery' }
  const hasActive = memberships.some((m) => m.payment_status === 'paid')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{role === 'admin' ? 'All Memberships' : 'My Memberships & Dues'}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {role === 'admin'
            ? 'Track payment status and manage dues across all members.'
            : 'View your membership status and pay outstanding dues.'}
        </p>
      </div>
      <div className="space-y-4">
        {memberships.map((m) => (
          <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{entityNames[m.entity_id] ?? 'Entity'}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{m.membership_number}</span>
                    <span className="capitalize">{m.plan} plan</span>
                  </div>
                </div>
              </div>
              <PaymentBadge status={m.payment_status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-xs text-slate-500">Amount Due</p><p className={`mt-0.5 text-sm font-semibold ${m.payment_status === 'overdue' ? 'text-red-600' : 'text-slate-800'}`}>{formatCurrency(m.amount_due)}</p></div>
              <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-xs text-slate-500">Amount Paid</p><p className="mt-0.5 text-sm font-semibold text-slate-800">{formatCurrency(m.amount_paid)}</p></div>
              <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-xs text-slate-500">Due Date</p><p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-800"><Calendar className="h-3.5 w-3.5" />{formatDate(m.due_date)}</p></div>
              <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-xs text-slate-500">Valid Until</p><p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-800"><Calendar className="h-3.5 w-3.5" />{formatDate(m.valid_until)}</p></div>
            </div>
            {m.payment_status !== 'paid' && m.payment_status !== 'waived' && role === 'member' && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <div><p className="text-sm font-medium text-amber-800">Payment outstanding</p><p className="text-xs text-amber-600">Renew to access all member benefits</p></div>
                <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">Pay Now</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {role === 'member' && (
        <ContentGuard paymentStatus={hasActive ? 'paid' : 'pending'} featureName="vendor contacts & magazine access">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-2 text-base font-semibold text-slate-900">Member Exclusive Content</h2>
            <p className="text-sm text-slate-500">Access vendor contacts, industry magazine, and member-only resources here.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {['Vendor Directory', 'BBHA Magazine', 'Event Invites', 'Trade Contacts'].map((item) => (
                <div key={item} className="rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700">{item}</div>
              ))}
            </div>
          </div>
        </ContentGuard>
      )}
    </div>
  )
}

// ─── Members View (Admin only) ────────────────────────────────
function DemoMembers() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Member Management</h1>
        <p className="mt-1 text-sm text-slate-500">Approve registrations, manage members, and bulk import.</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-900">
          <Users className="h-5 w-5" />Pending Approvals ({MOCK_PENDING_MEMBERS.length})
        </h2>
        <div className="space-y-2">
          {MOCK_PENDING_MEMBERS.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{m.full_name}</p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                  <span>{m.email}</span>
                  <span>{m.phone}</span>
                  <span>Registered {formatDate(m.created_at)}</span>
                </div>
              </div>
              <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
                <UserCheck className="h-3.5 w-3.5" /> Approve
              </button>
            </div>
          ))}
        </div>
      </div>
      <CSVImporter />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <Users className="h-5 w-5 text-slate-600" />
          <h2 className="text-base font-semibold text-slate-900">Active Members (5)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Entities</th>
                <th className="px-4 py-3 text-left font-semibold">Joined</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Rajan Mehta',   email: 'rajan@grandhotel.in',  entities: 1, joined: '15 Jan 2024' },
                { name: 'Priya Rao',     email: 'priya@spicegarden.in', entities: 1, joined: '01 Feb 2024' },
                { name: 'Vikram Singh',  email: 'vikram@nammabakery.in',entities: 1, joined: '10 Mar 2024' },
                { name: 'Meena Thomas',  email: 'meena@coastalbar.in',  entities: 1, joined: '05 Apr 2024' },
                { name: 'Arjun Nair',    email: 'arjun@biryanihouse.in',entities: 1, joined: '20 May 2024' },
              ].map((m) => (
                <tr key={m.email} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{m.name}</td>
                  <td className="px-4 py-3 text-slate-600">{m.email}</td>
                  <td className="px-4 py-3 text-slate-600">{m.entities}</td>
                  <td className="px-4 py-3 text-slate-600">{m.joined}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <UserCheck className="h-3.5 w-3.5" />Approved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Vendors View ─────────────────────────────────────────────
function DemoVendors({ role }: { role: UserRole }) {
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS)
  const [badges, setBadges]   = useState<VendorBadge[]>(MOCK_VENDOR_BADGES)

  function handleToggleEmpanelled(vendor: Vendor) {
    setVendors((prev) => prev.map((v) => v.id === vendor.id ? { ...v, is_empanelled: !v.is_empanelled } : v))
  }
  function handleDelete(vendor: Vendor) {
    setVendors((prev) => prev.filter((v) => v.id !== vendor.id))
    setBadges((prev) => prev.filter((b) => b.vendor_id !== vendor.id))
  }
  function handleBadgesUpdated(vendorId: string, updated: VendorBadge[]) {
    setBadges((prev) => [...prev.filter((b) => b.vendor_id !== vendorId), ...updated])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vendor Directory</h1>
        <p className="mt-1 text-sm text-slate-500">
          BBHA-empanelled suppliers across {MOCK_VENDOR_CATEGORIES.length} categories —
          {role === 'member' ? ' contact details visible to paid members.' : ' manage badges, empanelment, and renewal emails.'}
        </p>
      </div>
      <VendorSearch
        vendors={vendors}
        badges={badges}
        categories={MOCK_VENDOR_CATEGORIES}
        role={role}
        paymentStatus="paid"
        adminId={MOCK_ADMIN.id}
        onToggleEmpanelled={handleToggleEmpanelled}
        onDelete={handleDelete}
        onBadgesUpdated={handleBadgesUpdated}
      />
    </div>
  )
}

// ─── Notifications View ───────────────────────────────────────
function DemoNotifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="mt-1 text-sm text-slate-500">Stay on top of compliance alerts and membership updates.</p>
      </div>
      <NotificationCenter notifications={MOCK_NOTIFICATIONS} />
    </div>
  )
}

// ─── Payments View ───────────────────────────────────────────
function DemoPayments({ role }: { role: UserRole }) {
  const isAdmin = role === 'admin'
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>(MOCK_PAYMENT_SUBMISSIONS)
  const [settings, setSettings]       = useState<InvoiceSettings>(MOCK_INVOICE_SETTINGS)
  const [payModal, setPayModal]       = useState(false)

  function handleVerify(id: string, invoiceNumber: string) {
    setSubmissions((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: 'verified', invoice_number: invoiceNumber, verified_at: new Date().toISOString(), verified_by: MOCK_ADMIN.id } : s)
    )
  }
  function handleReject(id: string, reason: string) {
    setSubmissions((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: 'rejected', rejection_reason: reason, verified_at: new Date().toISOString(), verified_by: MOCK_ADMIN.id } : s)
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isAdmin ? 'Payments & Invoicing' : 'Pay Membership Dues'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? 'Verify UTR submissions, download invoices, and configure billing settings.'
              : 'Pay via UPI, NEFT, or cash and submit your UTR for verification.'}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setPayModal(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
          >
            <CreditCard className="h-4 w-4" /> Pay Now
          </button>
        )}
      </div>

      {isAdmin ? (
        <>
          <UTRVerificationPanel
            submissions={submissions}
            onVerify={handleVerify}
            onReject={handleReject}
          />
          <PaymentReports submissions={submissions} />
          <InvoiceSettingsPanel settings={settings} onSave={setSettings} />
        </>
      ) : (
        <>
          {/* Member: show their own submissions */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-900">My Payment Submissions</h2>
            {submissions.filter((s) => s.profile_id === MOCK_MEMBER.id).length === 0 ? (
              <p className="text-sm text-slate-500">No submissions yet. Click &quot;Pay Now&quot; to get started.</p>
            ) : (
              <div className="space-y-3">
                {submissions.filter((s) => s.profile_id === MOCK_MEMBER.id).map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">UTR: {s.utr_number}</p>
                      <p className="text-xs text-slate-500">₹{s.amount_paid.toLocaleString('en-IN')} · {s.payment_method.toUpperCase()} · {formatDate(s.submitted_at)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      s.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                      s.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {payModal && (
        <PaymentModal
          membership={MOCK_MEMBERSHIPS[2]}
          settings={settings}
          onSubmit={async (utr, method) => {
            const sub: PaymentSubmission = {
              id: `ps-${Date.now()}`, membership_id: MOCK_MEMBERSHIPS[2].id,
              profile_id: MOCK_MEMBER.id, utr_number: utr,
              amount_paid: settings.membership_fee * (1 + settings.gst_rate / 100),
              payment_method: method as PaymentSubmission['payment_method'],
              status: 'pending', rejection_reason: null, invoice_number: null,
              submitted_at: new Date().toISOString(), verified_at: null, verified_by: null, notes: null,
            }
            setSubmissions((prev) => [sub, ...prev])
            setPayModal(false)
          }}
          onClose={() => setPayModal(false)}
        />
      )}
    </div>
  )
}

// ─── Shared: StatCard ─────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color, onClick,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  onClick?: () => void
}) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-600 border-blue-100',
    green:  'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:  'bg-amber-50 text-amber-600 border-amber-100',
    red:    'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }
  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all ${onClick ? 'hover:border-amber-300 hover:shadow-md active:scale-[0.98]' : ''}`}
    >
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
      {onClick && (
        <p className="mt-1 text-[11px] font-medium text-amber-500 opacity-0 transition-opacity group-hover:opacity-100">
          Click to view details →
        </p>
      )}
    </button>
  )
}
