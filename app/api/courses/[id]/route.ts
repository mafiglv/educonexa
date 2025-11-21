import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
})

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true } },
      lessons: { orderBy: { order: "asc" } },
      resources: true,
      _count: { select: { enrollments: true, lessons: true } },
    },
  })

  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ course })
}

export async function PATCH(req: NextRequest, { params }: Params) {
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
    return NextResponse.json({ error: "Sem permissão para editar" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updateCourseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.course.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json({ course: updated })
}

export async function DELETE(_: NextRequest, { params }: Params) {
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
    return NextResponse.json({ error: "Sem permissão para apagar" }, { status: 403 })
  }

  await prisma.course.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
