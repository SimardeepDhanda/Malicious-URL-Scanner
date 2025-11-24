import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Malicious URL Scanner',
  description: 'Analyze URLs for security risks and indicators of compromise',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

