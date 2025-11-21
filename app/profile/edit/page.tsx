"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type MeResponse = {
  user: { id: string; name: string | null; email: string; profile?: { bio?: string | null; avatarUrl?: string | null } } | null
}

export default function EditProfilePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    const loadMe = async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) {
        router.push("/login")
        return
      }
      const data: MeResponse = await res.json()
      if (!data.user) {
        router.push("/login")
        return
      }
      setName(data.user.name ?? "")
      setBio(data.user.profile?.bio ?? "")
      const avatar = data.user.profile?.avatarUrl ?? ""
      setAvatarUrl(avatar)
      setPreview(avatar || null)
    }
    loadMe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, avatarUrl: avatarUrl || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(typeof data?.error === "string" ? data.error : "Erro ao salvar perfil.")
        return
      }
      setSuccess("Perfil atualizado!")
      setTimeout(() => router.push("/profile"), 800)
    } catch (err) {
      console.error(err)
      setError("Erro inesperado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Editar perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Fale sobre você" />
              </div>
              <div className="space-y-2">
                <Label>URL do avatar (use uma imagem pública)</Label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value)
                    setPreview(e.target.value || null)
                  }}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Upload de avatar (opcional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        setAvatarUrl(reader.result)
                        setPreview(reader.result)
                      }
                    }
                    reader.readAsDataURL(file)
                  }}
                />
                {preview && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Pré-visualização do avatar" className="h-24 w-24 rounded-full object-cover" />
                  </div>
                )}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
