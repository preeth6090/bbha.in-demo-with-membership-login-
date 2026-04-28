'use client'

import { useState } from 'react'
import { Announcement, AnnouncementType } from '@/lib/types'
import { Plus, Trash2, X, ToggleLeft, ToggleRight, Megaphone } from 'lucide-react'

const TYPE_OPTIONS: { value: AnnouncementType; label: string; pill: string }[] = [
  { value: 'info',    label: 'Info',    pill: 'bg-blue-100 text-blue-700 ring-blue-400' },
  { value: 'warning', label: 'Warning', pill: 'bg-amber-100 text-amber-700 ring-amber-400' },
  { value: 'promo',   label: 'Promo',   pill: 'bg-violet-100 text-violet-700 ring-violet-400' },
  { value: 'alert',   label: 'Alert',   pill: 'bg-red-100 text-red-700 ring-red-400' },
]

interface Props {
  announcements: Announcement[]
  onAdd: (message: string, type: AnnouncementType, expiresAt: string | null) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function AnnouncementManager({ announcements, onAdd, onToggle, onDelete, onClose }: Props) {
  const [message, setMessage] = useState('')
  const [type, setType] = useState<AnnouncementType>('info')
  const [expiresAt, setExpiresAt] = useState('')

  function handleAdd() {
    if (!message.trim()) return
    onAdd(message.trim(), type, expiresAt ? new Date(expiresAt).toISOString() : null)
    setMessage('')
    setExpiresAt('')
    setType('info')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Announcement Ticker</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Compose */}
        <div className="border-b border-slate-200 p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">New Announcement</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message — it will scroll in the portal ticker for all members…"
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            rows={2}
          />
          <div className="mt-3 flex flex-wrap items-end gap-3">
            {/* Type selector */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-600">Type</p>
              <div className="flex gap-1.5">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      type === opt.value
                        ? `${opt.pill} ring-2 ring-offset-1`
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-600">Expires (optional)</p>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!message.trim()}
              className="ml-auto flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Post
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            All Announcements ({announcements.length})
          </h3>
          {announcements.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No announcements yet.</p>
          )}
          <div className="space-y-2.5">
            {announcements.map((a) => {
              const opt = TYPE_OPTIONS.find((o) => o.value === a.type)!
              const expired = !!a.expires_at && new Date(a.expires_at) < new Date()
              return (
                <div
                  key={a.id}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                    a.is_active && !expired
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <span className={`mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${opt.pill}`}>
                    {opt.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-slate-800">{a.message}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {expired && <span className="font-medium text-red-500">Expired</span>}
                      {a.expires_at && !expired && (
                        <span>
                          · Expires{' '}
                          {new Date(a.expires_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      <span>· by {a.author_name ?? 'Admin'}</span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button
                      onClick={() => onToggle(a.id)}
                      title={a.is_active ? 'Deactivate' : 'Activate'}
                      className="rounded-lg p-1.5 hover:bg-white"
                    >
                      {a.is_active ? (
                        <ToggleRight className="h-5 w-5 text-amber-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                    <button onClick={() => onDelete(a.id)} className="rounded-lg p-1.5 hover:bg-white">
                      <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
