import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: 'Orient Barbershop Gossau | Haarschnitt & Bartpflege',
  description: 'Orient Barbershop in Gossau – Haarschnitte, Bartdesign und Männerpflege. Mo–Sa 10–20 Uhr. Online Termin buchen.',
  keywords: 'Barbershop Gossau, Friseur Gossau, Haarschnitt Gossau, Bart Gossau, Orient Barbershop',
  openGraph: {
    title: 'Orient Barbershop Gossau',
    description: 'Haarschnitte, Bartdesign und Männerpflege in Gossau. Jetzt Termin buchen.',
    type: 'website',
    locale: 'de_CH',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
