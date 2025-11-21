import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const resourceSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "PDF", "LINK"]).default("LINK"),
  url: z.string().url(),
  courseId: z.string().min(1),
})

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId") || undefined

  const resources = await prisma.resource.findMany({
    where: { courseId },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ resources })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = resourceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } })
  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
  }

  const isOwner = course.authorId === user.id || user.role === "ADMIN"
  if (!isOwner) {
    return NextResponse.json({ error: "Sem permissão para adicionar recurso" }, { status: 403 })
  }

  const resource = await prisma.resource.create({ data: parsed.data })
  return NextResponse.json({ resource }, { status: 201 })
}
