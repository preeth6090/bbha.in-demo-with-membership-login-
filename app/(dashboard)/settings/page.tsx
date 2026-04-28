import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account details</p>
      </div>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Profile Information</h2>
        <div className="space-y-4">
          <Field label="Full Name" value={profile?.full_name ?? ''} />
          <Field label="Email" value={profile?.email ?? ''} />
          <Field label="Phone" value={profile?.phone ?? ''} />
          <Field label="Role" value={profile?.role ?? 'member'} readonly />
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, readonly }: { label: string; value: string; readonly?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        defaultValue={value}
        readOnly={readonly}
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${
          readonly ? 'bg-slate-50 text-slate-500' : 'focus:border-amber-400 focus:outline-none'
        }`}
      />
    </div>
  )
}
