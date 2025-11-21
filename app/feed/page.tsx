import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import FeedClient, { type FeedPost } from "./feed-client"

export default async function FeedPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const postsData = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { avatarUrl: true, bio: true } },
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      likes: { select: { userId: true } },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  const posts: FeedPost[] = postsData.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    mediaUrl: p.mediaUrl || undefined,
    mediaType: p.mediaType || undefined,
    eventDate: p.eventDate ? p.eventDate.toISOString() : undefined,
    eventLocation: p.eventLocation || undefined,
    createdAt: p.createdAt.toISOString(),
    author: {
      id: p.author.id,
      name: p.author.name,
      email: p.author.email,
      avatarUrl: p.author.profile?.avatarUrl ?? undefined,
    },
    comments: p.comments.map((c) => ({
      id: c.id,
      content: c.content,
      author: { id: c.author.id, name: c.author.name ?? c.author.email },
      createdAt: c.createdAt.toISOString(),
    })),
    commentsCount: p._count.comments,
    likesCount: p._count.likes,
    likedByCurrent: p.likes.some((l) => l.userId === user.id),
    shareCount: p.shareCount,
  }))

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <FeedClient currentUserId={user.id} initialPosts={posts} />
      <BottomNav />
    </div>
  )
}
