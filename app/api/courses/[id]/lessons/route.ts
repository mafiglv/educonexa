import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const lessonSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3).optional(),
  videoUrl: z.string().url().optional(),
  content: z.string().optional(),
  order: z.number().int().positive().optional(),
})

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  const lessons = await prisma.lesson.findMany({
    where: { courseId: params.id },
    orderBy: { order: "asc" },
  })

  return NextResponse.json({ lessons })
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const course = await prisma.course.findUnique({ where: { id: params.id } })
  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
  }

  const isOwner = course.authorId === user.id || user.role === "ADMIN"
  if (!isOwner) {
    return NextResponse.json({ error: "Sem permissão para adicionar aula" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = lessonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const lessonCount = await prisma.lesson.count({ where: { courseId: params.id } })
  const lesson = await prisma.lesson.create({
    data: {
      ...parsed.data,
      order: parsed.data.order ?? lessonCount + 1,
      courseId: params.id,
    },
  })

  return NextResponse.json({ lesson }, { status: 201 })
}
