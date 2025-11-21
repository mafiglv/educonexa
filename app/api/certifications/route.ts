import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const certificationSchema = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(1),
  certificateCode: z.string().optional(),
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const certifications = await prisma.certification.findMany({
    where: { userId: user.id },
    include: {
      course: { select: { id: true, title: true } },
    },
    orderBy: { issuedAt: "desc" },
  })

  return NextResponse.json({ certifications })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Somente administradores emitem certificados" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = certificationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { userId, courseId, certificateCode } = parsed.data
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  const course = await prisma.course.findUnique({ where: { id: courseId } })

  if (!targetUser || !course) {
    return NextResponse.json({ error: "Usuário ou curso inválido" }, { status: 404 })
  }

  const certification = await prisma.certification.create({
    data: {
      userId,
      courseId,
      certificateCode: certificateCode ?? `CERT-${Date.now()}`,
    },
  })

  return NextResponse.json({ certification }, { status: 201 })
}
