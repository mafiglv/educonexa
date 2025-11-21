"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Props = {
  courseId: string
  question: string
  answer: string
}

export default function QuizClient({ courseId, question, answer }: Props) {
  const [value, setValue] = useState("")
  const [status, setStatus] = useState<"idle" | "error" | "success" | "loading">("idle")
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    const correct = value.trim().toLowerCase() === answer.toLowerCase()
    if (!correct) {
      setStatus("error")
      setMessage("Resposta incorreta. Tente novamente.")
      return
    }

    setStatus("loading")
    setMessage(null)
    try {
      const res = await fetch("/api/certifications/self", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setStatus("error")
        setMessage(typeof data?.error === "string" ? data.error : "Não foi possível gerar o certificado.")
        return
      }
      setStatus("success")
      setMessage("Certificado gerado!")
    } catch (err) {
      console.error(err)
      setStatus("error")
      setMessage("Erro inesperado.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-sm font-medium">{question}</p>
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Resposta" />
      {message && (
        <p className={`text-sm ${status === "success" ? "text-green-600" : "text-destructive"}`}>
          {message}
        </p>
      )}
      <Button type="submit" size="sm" disabled={status === "loading"}>
        {status === "loading" ? "Gerando..." : "Enviar e gerar certificado"}
      </Button>
    </form>
  )
}
