"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Newspaper, BookOpen, Award, User, Library } from "lucide-react"
import Image from "next/image"

export function DesktopNav() {
  const pathname = usePathname()

  const hiddenPaths = ["/", "/login"]
  if (hiddenPaths.includes(pathname)) {
    return null
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Início" },
    { href: "/feed", icon: Newspaper, label: "Feed" },
    { href: "/courses", icon: BookOpen, label: "Cursos" },
    { href: "/library", icon: Library, label: "Biblioteca" },
    { href: "/certifications", icon: Award, label: "Certificados" },
    { href: "/profile", icon: User, label: "Perfil" },
  ]

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative h-8 w-32 lg:h-10 lg:w-40">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-GzQBZ2wFuMhLZDI6Xi2if6kJEnF4xO.png"
                alt="EDUCONEXA"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} />
                  <span className="text-sm lg:text-base">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
