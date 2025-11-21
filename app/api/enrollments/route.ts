import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const enrollmentSchema = z.object({
  courseId: z.string().min(1),
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: { id: true, title: true, description: true, status: true },
      },
    },
  })

  return NextResponse.json({ enrollments })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = enrollmentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } })
  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: parsed.data.courseId } },
  })
  if (existing) {
    return NextResponse.json({ enrollment: existing })
  }

  const enrollment = await prisma.enrollment.create({
    data: { userId: user.id, courseId: parsed.data.courseId },
  })

  return NextResponse.json({ enrollment }, { status: 201 })
}
