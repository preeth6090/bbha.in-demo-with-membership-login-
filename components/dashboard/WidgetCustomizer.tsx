'use client'

import { useState } from 'react'
import { WidgetConfig } from '@/lib/types'
import { X, Eye, EyeOff, ChevronUp, ChevronDown, Settings2, RotateCcw } from 'lucide-react'

interface Props {
  widgets: WidgetConfig[]
  defaultWidgets: WidgetConfig[]
  onChange: (widgets: WidgetConfig[]) => void
  onClose: () => void
}

export function WidgetCustomizer({ widgets, defaultWidgets, onChange, onClose }: Props) {
  const [local, setLocal] = useState([...widgets].sort((a, b) => a.order - b.order))

  function toggleVisible(id: string) {
    setLocal((prev) => prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)))
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...local]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setLocal(next.map((w, i) => ({ ...w, order: i })))
  }

  function handleApply() {
    onChange(local)
    onClose()
  }

  function handleReset() {
    const reset = [...defaultWidgets].sort((a, b) => a.order - b.order)
    setLocal(reset)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">Customise Dashboard</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Widget list */}
        <div className="p-5">
          <p className="mb-4 text-sm text-slate-500">
            Toggle sections on or off, and reorder them with the arrows.
          </p>
          <div className="space-y-2">
            {local.map((w, i) => (
              <div
                key={w.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                  w.visible
                    ? 'border-slate-200 bg-white shadow-sm'
                    : 'border-slate-100 bg-slate-50 opacity-55'
                }`}
              >
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-20"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === local.length - 1}
                    className="rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-20"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Label */}
                <span className="flex-1 text-sm font-medium text-slate-800">{w.label}</span>

                {/* Role tag */}
                {(w.adminOnly || w.memberOnly) && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {w.adminOnly ? 'Admin' : 'Member'}
                  </span>
                )}

                {/* Toggle visibility */}
                <button
                  onClick={() => toggleVisible(w.id)}
                  title={w.visible ? 'Hide section' : 'Show section'}
                  className={`rounded-lg p-1.5 transition-colors ${
                    w.visible
                      ? 'text-amber-500 hover:bg-amber-50'
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {w.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to default
          </button>
          <button
            onClick={handleApply}
            className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
