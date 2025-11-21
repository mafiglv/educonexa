import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/bottom-nav"
import UserProfileClient from "../user-profile-client"

type Props = { params: { id: string } }

export default async function UserProfilePage({ params }: Props) {
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
    notFound()
  }

  const followersCount = user.followers.length
  const followingCount = user.following.length
  const isFollowing = viewer ? user.followers.some((f) => f.followerId === viewer.id) : false

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 lg:p-10 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{user.name || "Perfil"}</h1>
          <p className="text-white/90 text-sm md:text-base lg:text-lg">{user.email}</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span>{followersCount} seguidores</span>
            <span>{followingCount} seguindo</span>
          </div>
          <div className="mt-4">
            <UserProfileClient
              targetId={user.id}
              isFollowing={isFollowing}
              isSelf={viewer?.id === user.id}
            />
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8 max-w-4xl mx-auto">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Sobre</CardTitle>
            <CardDescription>Bio e informações públicas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-muted-foreground">{user.profile?.bio ?? "Sem bio ainda."}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Postagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.posts.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma postagem ainda.</p>
            )}
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

        <div className="flex gap-3">
          <Link href="/feed" className="text-sm text-primary underline">Voltar ao feed</Link>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
