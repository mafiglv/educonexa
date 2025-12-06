"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Clock } from "lucide-react"

export type FeedPost = {
  id: string
  title: string
  content: string
  mediaUrl?: string
  mediaType?: string
  eventDate?: string
  eventLocation?: string
  createdAt: string
  author: { id: string; name: string; email: string; avatarUrl?: string }
  comments: { id: string; content: string; author: { id: string; name: string }; createdAt: string }[]
  commentsCount: number
  likesCount: number
  likedByCurrent: boolean
  shareCount: number
  isFollowingAuthor?: boolean
  isSelf?: boolean
}

type Props = {
  currentUserId: string
  initialPosts: FeedPost[]
}

export default function FeedClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [mediaType, setMediaType] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [fileName, setFileName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          mediaUrl: mediaUrl.trim() || undefined,
          mediaType: mediaType || undefined,
          eventDate: eventDate || undefined,
          eventLocation: eventLocation || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(typeof data?.error === "string" ? data.error : "Não foi possível publicar.")
        return
      }
      const { post } = (await res.json()) as { post: FeedPost }
      setPosts((prev) => [post, ...prev])
      setTitle("")
      setContent("")
      setMediaUrl("")
      setMediaType("")
      setEventDate("")
      setEventLocation("")
      setFileName("")
    } catch (err) {
      console.error(err)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async (postId: string, liked: boolean) => {
    try {
      const method = liked ? "DELETE" : "POST"
      const res = await fetch(`/api/posts/${postId}/like`, { method })
      if (!res.ok) return
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByCurrent: !liked,
                likesCount: p.likesCount + (liked ? -1 : 1),
              }
            : p,
        ),
      )
    } catch (err) {
      console.error(err)
    }
  }

  const toggleFollow = async (authorId: string, isFollowing: boolean) => {
    try {
      const method = isFollowing ? "DELETE" : "POST"
      const res = await fetch(`/api/users/${authorId}/follow`, { method })
      if (!res.ok) return
      setPosts((prev) =>
        prev.map((p) =>
          p.author.id === authorId
            ? {
                ...p,
                isFollowingAuthor: !isFollowing,
              }
            : p,
        ),
      )
    } catch (err) {
      console.error(err)
    }
  }

  const addComment = async (postId: string, contentText: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentText }),
      })
      if (!res.ok) return
      const { comment } = (await res.json()) as {
        comment: { id: string; content: string; authorId: string }
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                commentsCount: p.commentsCount + 1,
                comments: [
                  ...p.comments,
                  { id: comment.id, content: contentText, author: { id: comment.authorId, name: "Você" }, createdAt: new Date().toISOString() },
                ],
              }
            : p,
        ),
      )
    } catch (err) {
      console.error(err)
    }
  }

  const sharePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/share`, { method: "POST" })
      if (!res.ok) return
      const { post } = (await res.json()) as { post: { id: string; shareCount: number } }
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, shareCount: post.shareCount } : p)))
      if (navigator.share) {
        await navigator.share({ title: "EDUCONEXA", url: `${window.location.origin}/feed` })
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 lg:p-10 text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Feed</h1>
          <p className="text-white/90 text-sm md:text-base lg:text-lg">Publique e acompanhe a comunidade</p>
        </div>
      </div>

      <div className="p-6 md:p-8 lg:p-10 space-y-4 md:space-y-6 max-w-4xl mx-auto">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Criar postagem</CardTitle>
            <CardDescription>Compartilhe novidades, eventos ou ideias.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3 md:space-y-4" onSubmit={handleCreate}>
              <Input
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={140}
              />
              <Textarea
                placeholder="No que você está pensando?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="URL de mídia (imagem/vídeo/link) opcional"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
                <Input
                  placeholder="Tipo de mídia (IMAGE, VIDEO, LINK)"
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                />
                <Input
                  type="datetime-local"
                  placeholder="Data do evento (opcional)"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
                <Input
                  placeholder="Local do evento (opcional)"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">Ou envie uma imagem/vídeo do dispositivo</label>
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
                          setMediaType(file.type || "UPLOAD")
                          setFileName(file.name)
                        }
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                  {fileName && <p className="text-xs text-muted-foreground">Selecionado: {fileName}</p>}
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? "Publicando..." : "Publicar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {posts.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="py-10 text-center text-muted-foreground">Nenhuma postagem ainda.</CardContent>
          </Card>
        )}

        {posts.map((post) => (
          <Card key={post.id} className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 md:pb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-col">
                  <Link
                    href={`/users/${post.author.id}`}
                    className="font-semibold text-base md:text-lg hover:text-primary transition-colors"
                  >
                    {post.author.name || post.author.email}
                  </Link>
                  <span className="text-xs text-muted-foreground">{post.author.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!post.isSelf && (
                    <Button
                      size="sm"
                      variant={post.isFollowingAuthor ? "outline" : "default"}
                      onClick={() => toggleFollow(post.author.id, post.isFollowingAuthor ?? false)}
                    >
                      {post.isFollowingAuthor ? "Seguindo" : "Seguir"}
                    </Button>
                  )}
                  <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-xs md:text-sm">
                    Post
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg md:text-xl leading-tight">{post.title}</CardTitle>
              <CardDescription className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {post.content}
              </CardDescription>
              {post.mediaUrl && (
                <div className="mt-3">
                  {post.mediaType?.toLowerCase().includes("video") ? (
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border/70">
                      <iframe
                        src={post.mediaUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={post.title}
                      />
                    </div>
                  ) : post.mediaUrl.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.mediaUrl} alt={post.title} className="w-full rounded-lg border border-border/70" />
                  ) : (
                    <a href={post.mediaUrl} className="text-primary underline break-all" target="_blank" rel="noreferrer">
                      {post.mediaUrl}
                    </a>
                  )}
                </div>
              )}
              {post.eventDate && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Evento: {new Date(post.eventDate).toLocaleString("pt-BR")} {post.eventLocation && `• ${post.eventLocation}`}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm md:text-base text-muted-foreground border-t pt-3 md:pt-4">
                <span className="flex items-center gap-2 text-xs md:text-sm">
                  <Clock className="h-4 w-4" />
                  {new Date(post.createdAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div className="flex items-center gap-4 md:gap-6">
                  <button
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                    onClick={() => toggleLike(post.id, post.likedByCurrent)}
                  >
                    <span>{post.likedByCurrent ? "❤" : "♡"}</span>
                    <span className="text-xs md:text-sm">{post.likesCount}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-xs md:text-sm">{post.commentsCount}</span>
                  </div>
                  <button className="text-xs md:text-sm hover:text-primary" onClick={() => sharePost(post.id)}>
                    Compartilhar ({post.shareCount})
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {post.comments.map((c) => (
                  <div key={c.id} className="border border-border/50 rounded p-2 text-sm">
                    <div className="font-semibold">{c.author.name}</div>
                    <div className="text-muted-foreground text-xs mb-1">
                      {new Date(c.createdAt).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                    </div>
                    <p className="whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
                <CommentForm onSubmit={(text) => addComment(post.id, text)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CommentForm({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  return (
    <form
      className="flex gap-2 items-start"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        setSending(true)
        await onSubmit(text.trim())
        setText("")
        setSending(false)
      }}
    >
      <Textarea
        placeholder="Comente algo..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[70px]"
      />
      <Button type="submit" disabled={sending} className="h-10 mt-1">
        {sending ? "..." : "Enviar"}
      </Button>
    </form>
  )
}
