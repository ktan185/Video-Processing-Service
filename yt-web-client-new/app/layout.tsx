import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './navbar/navbar'
import { UserProfile } from './navbar/user'
import { UserProvider } from './context/UserContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube',
  description: 'YouTube Clone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <Navbar />
        </UserProvider>
        {children}
      </body>
    </html>
  )
}
