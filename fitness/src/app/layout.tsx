import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './provider'
import { Toaster } from "react-hot-toast"


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Your Fitness App',
  description: 'Your personal fitness companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Providers>
        <body className={inter.className}>
          {children}
          <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 3000, style: { background: '#363636', color: '#fff', }, }} />

        </body>
      </Providers>
    </html>
  )
}