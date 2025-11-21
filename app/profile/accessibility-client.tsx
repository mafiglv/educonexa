"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Moon, Type, Bell, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

type Props = {
  showLogoutOnly?: boolean
}

export default function AccessibilityCard({ showLogoutOnly }: Props) {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium")
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  useEffect(() => {
    const html = document.documentElement
    html.style.fontSize = fontSize === "small" ? "14px" : fontSize === "large" ? "18px" : "16px"
  }, [fontSize])

  if (showLogoutOnly) {
    return (
      <Button
        variant="outline"
        className="w-full gap-2 text-destructive hover:text-destructive bg-transparent md:text-base border-destructive/50"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" })
          router.push("/login")
        }}
      >
        <LogOut className="h-4 w-4 md:h-5 md:w-5" />
        Sair da conta
      </Button>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <span>Acessibilidade</span>
        </CardTitle>
        <CardDescription>Personalize sua experiência</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Moon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            <Label htmlFor="dark-mode" className="cursor-pointer md:text-base">
              Modo escuro
            </Label>
          </div>
          <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
        </div>

        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 md:gap-3">
            <Type className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            <Label className="md:text-base">Tamanho da fonte</Label>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button
              variant={fontSize === "small" ? "default" : "outline"}
              size="sm"
              onClick={() => setFontSize("small")}
              className="flex-1 md:text-base"
            >
              Pequeno
            </Button>
            <Button
              variant={fontSize === "medium" ? "default" : "outline"}
              size="sm"
              onClick={() => setFontSize("medium")}
              className="flex-1 md:text-base"
            >
              Médio
            </Button>
            <Button
              variant={fontSize === "large" ? "default" : "outline"}
              size="sm"
              onClick={() => setFontSize("large")}
              className="flex-1 md:text-base"
            >
              Grande
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Bell className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            <Label htmlFor="notifications" className="cursor-pointer md:text-base">
              Notificações
            </Label>
          </div>
          <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
        </div>
      </CardContent>
    </Card>
  )
}
