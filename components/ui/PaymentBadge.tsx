import { PaymentStatus } from '@/lib/types'
import { CheckCircle2, Clock, AlertCircle, Minus } from 'lucide-react'

const CONFIG: Record<PaymentStatus, { label: string; className: string; Icon: React.ElementType }> = {
  paid:    { label: 'Paid',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  pending: { label: 'Pending', className: 'bg-amber-50  text-amber-700  border-amber-200',   Icon: Clock },
  overdue: { label: 'Overdue', className: 'bg-red-50    text-red-700    border-red-200',     Icon: AlertCircle },
  waived:  { label: 'Waived',  className: 'bg-slate-50  text-slate-600  border-slate-200',   Icon: Minus },
}

interface PaymentBadgeProps {
  status: PaymentStatus
  size?: 'sm' | 'md'
}

export function PaymentBadge({ status, size = 'md' }: PaymentBadgeProps) {
  const { label, className, Icon } = CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium ${className} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </span>
  )
}
