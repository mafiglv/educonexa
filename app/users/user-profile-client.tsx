"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  targetId: string
  isFollowing: boolean
  isSelf: boolean
}

export default function UserProfileClient({ targetId, isFollowing: initialFollowing, isSelf }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isSelf) return null

  const toggleFollow = async () => {
    setLoading(true)
    setError(null)
    try {
      const method = isFollowing ? "DELETE" : "POST"
      const res = await fetch(`/api/users/${targetId}/follow`, { method })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(typeof data?.error === "string" ? data.error : "Não foi possível atualizar o follow.")
        return
      }
      setIsFollowing(!isFollowing)
    } catch (err) {
      console.error(err)
      setError("Erro inesperado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant={isFollowing ? "outline" : "default"} size="sm" onClick={toggleFollow} disabled={loading}>
        {loading ? "..." : isFollowing ? "Deixar de seguir" : "Seguir"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
