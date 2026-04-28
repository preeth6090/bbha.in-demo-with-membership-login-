export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDocumentType(type: string): string {
  return type.replace(/_/g, ' ')
}

export function generateMembershipNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `BBHA-${year}-${random}`
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str
}
