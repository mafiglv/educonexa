import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const viewer = await getCurrentUser()

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
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
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  const followingIds = new Set(user.following.map((f) => f.followingId))
  const followerIds = new Set(user.followers.map((f) => f.followerId))
  const isFollowing = viewer ? followerIds.has(viewer.id) : false
  const isSelf = viewer?.id === user.id

  return NextResponse.json({
    user: {
      ...user,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing,
      isSelf,
    },
  })
}
