import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'BBHA Member Portal',
  description: 'Bangalore Hotels Association — Official Member Portal',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'BBHA' },
  icons: { apple: '/icons/icon-192.png' },
}

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full bg-slate-50 font-sans">{children}</body>
    </html>
  )
}
