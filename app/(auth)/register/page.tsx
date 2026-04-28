'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Hotel, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone, role: 'member' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Application Submitted!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your membership application is under review. You&apos;ll receive an email once approved by the BBHA team.
          </p>
          <Link
            href="/login"
            className="mt-6 block rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-lg">
            <Hotel className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Apply for Membership</h1>
          <p className="mt-1 text-sm text-slate-400">Bangalore Hotels Association</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name *</label>
              <input type="text" value={form.fullName} onChange={update('fullName')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                placeholder="Your full name" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email *</label>
              <input type="email" value={form.email} onChange={update('email')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                placeholder="you@example.com" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
              <input type="tel" value={form.phone} onChange={update('phone')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password *</label>
              <input type="password" value={form.password} onChange={update('password')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                placeholder="Min. 8 characters" minLength={8} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password *</label>
              <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                placeholder="••••••••" required />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Submitting…' : 'Apply for Membership'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already a member?{' '}
            <Link href="/login" className="font-medium text-amber-600 hover:text-amber-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
