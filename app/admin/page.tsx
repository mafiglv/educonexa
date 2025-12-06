import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Administração",
}

export default async function AdminPage() {
  const current = await getCurrentUser()
  if (!current || current.role !== "ADMIN") {
    redirect("/login")
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Administração</h1>
          <p className="text-muted-foreground">Gerencie papéis de usuário</p>
        </div>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 border border-border/50 rounded px-3 py-2">
                <div className="flex flex-col">
                  <span className="font-semibold">{u.name || u.email}</span>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{u.role}</span>
                  <RoleSwitcher userId={u.id} currentRole={u.role} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RoleSwitcher({ userId, currentRole }: { userId: string; currentRole: "USER" | "ADMIN" }) {
  const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN"
  return (
    <form
      action={`/api/admin/users/${userId}/role`}
      method="post"
      className="inline-block"
      onSubmit={(e) => {
        e.preventDefault()
        fetch(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: nextRole }),
        }).then(() => {
          window.location.reload()
        })
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        Tornar {nextRole}
      </Button>
    </form>
  )
}
