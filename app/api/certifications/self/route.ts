import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const selfCertSchema = z.object({
  courseId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = selfCertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } })
  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
  }

  const certification = await prisma.certification.upsert({
    where: {
      userId_courseId: { userId: user.id, courseId: course.id },
    },
    update: {},
    create: {
      userId: user.id,
      courseId: course.id,
      certificateCode: `CERT-${Date.now()}`,
    },
  })

  return NextResponse.json({ certification }, { status: 201 })
}
