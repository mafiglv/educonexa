"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { DesktopNav } from "./desktop-nav"

export function NavFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hasNav = !["/", "/login"].includes(pathname)

  return (
    <>
      {hasNav && <DesktopNav />}
      <div className={hasNav ? "md:pt-16 lg:pt-20" : undefined}>{children}</div>
    </>
  )
}
