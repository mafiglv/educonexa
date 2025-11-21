"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSignup = searchParams.get("signup") === "true"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    try {
      const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login"
      const payload = isSignup ? { name, email, password } : { email, password }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Nao foi possivel autenticar. Verifique os dados e tente novamente."
        setErrorMessage(message)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      console.error(err)
      setErrorMessage("Erro inesperado. Tente novamente em instantes.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-10 flex flex-col">
      {/* Back Button */}
      <Link href="/" className="mb-6">
        <Button variant="ghost" size="sm" className="gap-2 md:text-base">
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          Voltar
        </Button>
      </Link>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md lg:max-w-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
              {isSignup ? "Criar conta" : "Entrar"}
            </CardTitle>
            <CardDescription className="md:text-base">
              {isSignup
                ? "Preencha os dados para criar sua conta"
                : "Entre com suas credenciais para acessar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="md:text-base">
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="md:h-12 md:text-base"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="md:text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="md:h-12 md:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="md:text-base">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="md:h-12 md:text-base"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              )}

              <Button type="submit" className="w-full md:text-lg md:h-12 lg:h-14" size="lg" disabled={loading}>
                {loading ? "Processando..." : isSignup ? "Criar conta" : "Entrar"}
              </Button>

              <div className="text-center text-sm md:text-base">
                {isSignup ? (
                  <p className="text-muted-foreground">
                    Ja tem uma conta?{" "}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                      Entrar
                    </Link>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Nao tem uma conta?{" "}
                    <Link href="/login?signup=true" className="text-primary font-semibold hover:underline">
                      Criar conta
                    </Link>
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
