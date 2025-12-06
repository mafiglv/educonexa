import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  courseId: z.string().optional(),
  mediaUrl: z.string().url().or(z.string().startsWith("data:")).optional(),
  mediaType: z.string().optional(),
  eventDate: z.string().datetime().optional(),
  eventLocation: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  const userId = req.nextUrl.searchParams.get("userId") ?? undefined

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { avatarUrl: true, bio: true } },
        },
      },
      course: { select: { id: true, title: true } },
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
  })

  const formatted = posts.map((p) => ({
    ...p,
    likedByCurrent: user ? p.likes.some((l) => l.userId === user.id) : false,
  }))

  return NextResponse.json({ posts: formatted })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      courseId: parsed.data.courseId,
      mediaUrl: parsed.data.mediaUrl,
      mediaType: parsed.data.mediaType,
      eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : undefined,
      eventLocation: parsed.data.eventLocation,
      authorId: user.id,
    },
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
      },
      likes: { select: { userId: true } },
      _count: { select: { comments: true, likes: true } },
    },
  })

  return NextResponse.json(
    { post: { ...post, likedByCurrent: false } },
    { status: 201 },
  )
}
