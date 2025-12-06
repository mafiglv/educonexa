import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Suspense } from "react"
import { NavFrame } from "@/components/nav-frame"

export const metadata: Metadata = {
  title: {
    default: "EDUCONEXA - Inclusão Educacional",
    template: "%s | EDUCONEXA",
  },
  description: "Plataforma colaborativa para promoção da inclusão educacional",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
    other: [{ rel: "icon", url: "/logo.png" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <NavFrame>
          <Suspense fallback={null}>{children}</Suspense>
        </NavFrame>
      </body>
    </html>
  )
}
