'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Entity, Membership, UserRole } from '@/lib/types'
import { EntityCard } from '@/components/ui/EntityCard'
import { FeeAdjustmentModal } from '@/components/admin/FeeAdjustmentModal'
import { Plus, Building2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [role, setRole] = useState<UserRole>('member')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [adjustTarget, setAdjustTarget] = useState<{ entity: Entity; membership: Membership } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      const userRole = (profile?.role ?? 'member') as UserRole
      setRole(userRole)

      const query = supabase.from('entities')
        .select('*, memberships(*)')
        .order('created_at', { ascending: false })

      const { data } = userRole === 'admin'
        ? await query
        : await query.eq('owner_id', user.id)

      setEntities((data as Entity[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleAdjustFee(entity: Entity) {
    const membership = entity.memberships?.[0]
    if (!membership) return
    setAdjustTarget({ entity, membership })
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {role === 'admin' ? 'All Entities' : 'My Entities'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {entities.length} establishment{entities.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        {role === 'member' && (
          <Link
            href="/entities/new"
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            Add Entity
          </Link>
        )}
      </div>

      {entities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16">
          <Building2 className="h-12 w-12 text-slate-300" />
          <p className="mt-3 text-slate-500">No entities registered yet</p>
          {role === 'member' && (
            <Link
              href="/entities/new"
              className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              Register your first entity
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entities.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              role={role}
              onAdjustFee={handleAdjustFee}
            />
          ))}
        </div>
      )}

      {adjustTarget && (
        <FeeAdjustmentModal
          membership={adjustTarget.membership}
          adminId={userId}
          onClose={() => setAdjustTarget(null)}
          onSuccess={() => {
            setAdjustTarget(null)
            // Re-fetch entities
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
