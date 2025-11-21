import Link from "next/link"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AccessibilityCard from "./accessibility-client"

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const profileData = await prisma.user.findUnique({
    where: { id: user.id },
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

  if (!profileData) {
    redirect("/login")
  }

  const followersCount = profileData.followers.length
  const followingCount = profileData.following.length

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 lg:p-10 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={profileData.profile?.avatarUrl ?? undefined} alt={profileData.name ?? profileData.email} />
              <AvatarFallback>{(profileData.name ?? profileData.email)?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{profileData.name || "Seu perfil"}</h1>
              <p className="text-white/90 text-sm md:text-base lg:text-lg">{profileData.email}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span>{followersCount} seguidores</span>
                <span>{followingCount} seguindo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8 max-w-4xl mx-auto">
        <AccessibilityCard />

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Sobre</CardTitle>
            <CardDescription>Adicione uma bio para que outros conheçam você.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-muted-foreground">
              {profileData.profile?.bio ?? "Nenhuma bio adicionada ainda."}
            </p>
            <div className="mt-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/profile/edit">Editar perfil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Suas postagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileData.posts.length === 0 && (
              <p className="text-sm text-muted-foreground">Você ainda não publicou nada.</p>
            )}
            {profileData.posts.map((post) => (
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
          <Button asChild variant="outline">
            <Link href="/feed">Voltar ao feed</Link>
          </Button>
          <Button asChild>
            <Link href="/feed">Criar nova postagem</Link>
          </Button>
        </div>

        <AccessibilityCard showLogoutOnly />
      </div>

      <BottomNav />
    </div>
  )
}
