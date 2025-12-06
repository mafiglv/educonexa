import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import UserProfileClient from "../user-profile-client"

type Params = { params: { id: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { name: true, email: true },
  })
  const name = user?.name || user?.email || "Perfil"
  return { title: `${name}` }
}

export default async function UserProfilePage({ params }: Params) {
  const viewer = await getCurrentUser()

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      profile: { select: { bio: true, avatarUrl: true } },
      followers: { select: { followerId: true } },
      following: { select: { followingId: true } },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          _count: { select: { comments: true } },
        },
      },
    },
  })

  if (!user) {
    redirect("/dashboard")
  }

  const isSelf = viewer?.id === user.id
  const isFollowing = viewer ? user.followers.some((f) => f.followerId === viewer.id) : false
  const followersCount = user.followers.length
  const followingCount = user.following.length

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary/80 via-accent/60 to-secondary/80 p-6 md:p-8 lg:p-10 text-foreground">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.profile?.avatarUrl ?? undefined} alt={user.name ?? user.email} />
              <AvatarFallback>{(user.name ?? user.email)?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">{user.name || "Perfil"}</h1>
              <p className="text-slate-800 text-sm md:text-base lg:text-lg">{user.email}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{followersCount} seguidores</span>
                <span>{followingCount} seguindo</span>
              </div>
            </div>
            <UserProfileClient targetId={user.id} isFollowing={isFollowing} isSelf={isSelf} />
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8 max-w-4xl mx-auto">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Sobre</CardTitle>
            <CardDescription>{user.profile?.bio ? "Bio do usuário" : "Nenhuma bio adicionada."}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-muted-foreground">
              {user.profile?.bio ?? "Este usuário ainda não adicionou uma bio."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Postagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.posts.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma postagem ainda.</p>}
            {user.posts.map((post) => (
              <Card key={post.id} className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge>Post</Badge>
                    <span className="text-xs text-muted-foreground">
                      {post.createdAt.toLocaleDateString("pt-BR")}{" "}
                      {post.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <CardTitle className="text-base md:text-lg">{post.title}</CardTitle>
                  <CardDescription className="text-sm md:text-base whitespace-pre-wrap">{post.content}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">{post._count.comments} comentários</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
