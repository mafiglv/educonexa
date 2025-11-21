import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1),
})

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  const comments = await prisma.comment.findMany({
    where: { postId: params.id },
    include: {
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({ comments })
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = commentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const postExists = await prisma.post.findUnique({ where: { id: params.id } })
  if (!postExists) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      postId: params.id,
      authorId: user.id,
    },
  })

  return NextResponse.json({ comment }, { status: 201 })
}
