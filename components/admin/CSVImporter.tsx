'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, Download, X } from 'lucide-react'

interface ImportRow {
  email: string
  full_name: string
  phone: string
  entity_name: string
  entity_type: string
  gstin: string
  fssai_number: string
  address: string
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

const TEMPLATE_HEADERS = [
  'email', 'full_name', 'phone', 'entity_name', 'entity_type', 'gstin', 'fssai_number', 'address'
]

export function CSVImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function parseCSV(text: string): ImportRow[] {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
      return headers.reduce((obj, header, i) => ({
        ...obj,
        [header]: values[i] ?? '',
      }), {} as ImportRow)
    })
  }

  function handleFile(f: File) {
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setPreview(parseCSV(text).slice(0, 5))
    }
    reader.readAsText(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'text/csv' || f?.name.endsWith('.csv')) handleFile(f)
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/members/import', { method: 'POST', body: formData })
    const data = await res.json()
    setResult(data)
    setLoading(false)
    if (data.success > 0) { setFile(null); setPreview([]) }
  }

  function downloadTemplate() {
    const csv = TEMPLATE_HEADERS.join(',') + '\n' +
      'john@example.com,John Doe,+919876543210,Grand Hotel,Hotel,29AABCT1332L1ZT,11225523000123,"MG Road, Bangalore"'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'bbha_import_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
            <Upload className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Bulk Member Import</h2>
            <p className="text-xs text-slate-500">Upload a CSV to add multiple members at once</p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Download className="h-3.5 w-3.5" />
          Download Template
        </button>
      </div>

      <div className="p-6">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all ${
            dragOver
              ? 'border-amber-400 bg-amber-50'
              : file
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-slate-300 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/50'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <>
              <FileText className="h-10 w-10 text-emerald-500" />
              <p className="mt-2 font-medium text-emerald-700">{file.name}</p>
              <p className="text-sm text-emerald-600">{preview.length}+ rows ready to import</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-slate-300" />
              <p className="mt-2 font-medium text-slate-600">Drop your CSV here or click to browse</p>
              <p className="text-sm text-slate-400">Supported: .csv files only</p>
            </>
          )}
        </div>

        {/* Preview table */}
        {preview.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {TEMPLATE_HEADERS.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold capitalize">
                      {h.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {preview.map((row, i) => (
                  <tr key={i}>
                    {TEMPLATE_HEADERS.map((h) => (
                      <td key={h} className="px-3 py-2 text-slate-700">
                        {(row as unknown as Record<string, string>)[h] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-3 py-1.5 text-xs text-slate-400">Showing first {preview.length} rows</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`mt-4 flex items-start gap-3 rounded-lg border p-4 ${
            result.failed === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
          }`}>
            {result.failed === 0
              ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              : <AlertCircle className="h-5 w-5 text-amber-600" />}
            <div>
              <p className="text-sm font-medium text-slate-800">
                {result.success} imported successfully{result.failed > 0 ? `, ${result.failed} failed` : ''}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-red-600">
                  {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
            <button onClick={() => setResult(null)} className="ml-auto text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Actions */}
        {file && !result && (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {loading ? 'Importing…' : 'Import Members'}
            </button>
            <button
              onClick={() => { setFile(null); setPreview([]) }}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
