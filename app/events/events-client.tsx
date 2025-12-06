"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Filter, PlusCircle } from "lucide-react"

export type EventItem = {
  id: string
  title: string
  description: string
  eventDate: string
  eventLocation?: string
  mediaUrl?: string
  createdAt: string
  author: { id: string; name: string; email: string }
}

type Props = {
  currentUserId: string
  initialEvents: EventItem[]
}

export default function EventsClient({ initialEvents }: Props) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
      ),
    [events],
  )

  const refreshEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (from) params.set("from", new Date(from).toISOString())
      if (to) params.set("to", new Date(to).toISOString())
      const res = await fetch(`/api/events?${params.toString()}`)
      if (!res.ok) {
        setError("Não foi possível carregar eventos.")
        return
      }
      const data = (await res.json()) as { events?: EventItem[] }
      setEvents(data.events ?? [])
    } catch (err) {
      console.error(err)
      setError("Erro ao buscar eventos.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !eventDate) return

    const parsedDate = new Date(eventDate)
    if (Number.isNaN(parsedDate.getTime())) {
      setCreateError("Data inválida.")
      return
    }

    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          eventDate: parsedDate.toISOString(),
          eventLocation: eventLocation.trim() || "Online",
          mediaUrl: mediaUrl.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setCreateError(typeof data?.error === "string" ? data.error : "Não foi possível criar o evento.")
        return
      }
      const { event } = (await res.json()) as { event: EventItem }
      setEvents((prev) =>
        [...prev, event].sort(
          (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
        ),
      )
      setTitle("")
      setDescription("")
      setEventDate("")
      setEventLocation("")
      setMediaUrl("")
      setFileName("")
    } catch (err) {
      console.error(err)
      setCreateError("Erro inesperado. Tente novamente.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 lg:p-10 text-white">
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="uppercase text-xs tracking-[0.25em] text-white/80">Eventos</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">Criar e acompanhar eventos</h1>
          <p className="text-white/85 max-w-3xl">
            Organize encontros e veja o que está por vir. Filtre por data, crie eventos dedicados e compartilhe com a comunidade.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <PlusCircle className="h-5 w-5" />
              Novo evento
            </CardTitle>
            <CardDescription>Defina data, local e um resumo para divulgar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Título do evento"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                />
                <Input
                  type="datetime-local"
                  placeholder="Data e hora"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
                <Input
                  placeholder="Local (ex.: Online ou endereço)"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
                <Input
                  placeholder="Link opcional (imagem/vídeo/link de inscrição)"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">Ou envie uma imagem/arquivo do dispositivo</label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          setMediaUrl(reader.result)
                          setFileName(file.name)
                        }
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                  {fileName && <p className="text-xs text-muted-foreground">Selecionado: {fileName}</p>}
                </div>
              </div>
              <Textarea
                placeholder="Descrição breve do evento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
              {createError && <p className="text-sm text-destructive">{createError}</p>}
              <Button type="submit" disabled={creating}>
                {creating ? "Criando..." : "Publicar evento"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Filter className="h-5 w-5" />
              Filtrar por data
            </CardTitle>
            <CardDescription>Veja próximos eventos por intervalo.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm text-muted-foreground">A partir de</label>
              <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm text-muted-foreground">Até</label>
              <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button variant="outline" onClick={refreshEvents} disabled={loading}>
              {loading ? "Filtrando..." : "Aplicar filtros"}
            </Button>
          </CardContent>
          {error && <p className="px-6 pb-4 text-sm text-destructive">{error}</p>}
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold">Próximos eventos</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {sortedEvents.length} agendado(s)
            </Badge>
          </div>

          {sortedEvents.length === 0 && (
            <Card className="border-border/50">
              <CardContent className="py-10 text-center text-muted-foreground">Nenhum evento encontrado para o filtro.</CardContent>
            </Card>
          )}

          {sortedEvents.map((event) => (
            <Card key={event.id} className="border-border/60 hover:shadow-md transition-shadow">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.eventDate).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <CardTitle className="text-lg md:text-xl">{event.title}</CardTitle>
                <CardDescription className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                {event.eventLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.eventLocation}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Publicado por {event.author.name || event.author.email} em{" "}
                    {new Date(event.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
                {event.mediaUrl && (
                  <a
                    href={event.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    Acessar link do evento
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
