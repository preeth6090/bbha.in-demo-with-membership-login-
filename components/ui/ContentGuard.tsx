'use client'

import { PaymentStatus } from '@/lib/types'
import { Lock, CreditCard } from 'lucide-react'
import Link from 'next/link'

interface ContentGuardProps {
  paymentStatus: PaymentStatus
  children: React.ReactNode
  featureName?: string
  blurIntensity?: 'sm' | 'md' | 'lg'
}

export function ContentGuard({
  paymentStatus,
  children,
  featureName = 'this feature',
  blurIntensity = 'md',
}: ContentGuardProps) {
  const isLocked = paymentStatus !== 'paid' && paymentStatus !== 'waived'

  if (!isLocked) return <>{children}</>

  const blurClass = { sm: 'blur-sm', md: 'blur-md', lg: 'blur-lg' }[blurIntensity]

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className={`select-none ${blurClass} pointer-events-none`} aria-hidden>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-3 text-center p-6 max-w-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-200">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Access Locked</h3>
            <p className="mt-1 text-sm text-slate-500">
              Complete your membership payment to unlock {featureName}.
            </p>
          </div>
          <Link
            href="/memberships"
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Pay Now
          </Link>
        </div>
      </div>
    </div>
  )
}
