import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "🐾 Paws or Peeps 💁 - Transform Cats to Humans and Humans to Cats",
  description: "Upload a photo of a cat or human and see the magical transformation!",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-b from-white to-rose-50`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <main className="min-h-screen bg-[url('/placeholder.svg?key=epxw1')] bg-repeat bg-opacity-5">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'