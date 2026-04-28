import { Hotel, Clock, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export default function PendingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-2xl">
        {/* Logo */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-lg">
          <Hotel className="h-8 w-8 text-white" />
        </div>

        {/* Status icon */}
        <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-200">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">Validation Pending</h1>
        <p className="mt-3 text-slate-500">
          Your membership application is being reviewed by the BBHA team. This typically takes{' '}
          <strong className="text-slate-700">1–2 business days</strong>.
        </p>

        {/* What happens next */}
        <div className="mt-6 rounded-xl bg-slate-50 p-5 text-left">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">What happens next?</h2>
          <ol className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">1</span>
              Our team reviews your application details
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">2</span>
              You receive an approval email with login access
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">3</span>
              Complete your membership payment to unlock all features
            </li>
          </ol>
        </div>

        {/* Contact */}
        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-500">
          <p>Need help? Contact us:</p>
          <a href="mailto:membership@bbha.in" className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700">
            <Mail className="h-4 w-4" />
            membership@bbha.in
          </a>
          <a href="tel:+918023450000" className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700">
            <Phone className="h-4 w-4" />
            +91 80 2345 0000
          </a>
        </div>

        <Link
          href="/login"
          className="mt-6 block rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
