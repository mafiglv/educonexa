import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Suspense } from "react"
import { DesktopNav } from "@/components/desktop-nav"

export const metadata: Metadata = {
  title: "EDUCONEXA - Inclusão Educacional",
  description: "Plataforma colaborativa para promoção da inclusão educacional",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <DesktopNav />
        <div className="md:pt-16 lg:pt-20">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </body>
    </html>
  )
}
