import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = { params: { id: string } }

export async function POST(_: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: { id: true, courseId: true },
  })
  if (!lesson) {
    return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
  }

  // Marca como concluída
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    update: {},
    create: { userId: user.id, lessonId: lesson.id },
  })

  const totalLessons = await prisma.lesson.count({ where: { courseId: lesson.courseId } })
  const completedLessons = await prisma.lessonProgress.count({
    where: { userId: user.id, lesson: { courseId: lesson.courseId } },
  })
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Upsert inscrição com progresso
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: lesson.courseId } },
    update: { progress: progressPct, lastAccessed: new Date() },
    create: {
      userId: user.id,
      courseId: lesson.courseId,
      progress: progressPct,
      lastAccessed: new Date(),
    },
  })

  // Concede certificado se 100%
  let certification = null
  if (progressPct >= 100) {
    certification = await prisma.certification.upsert({
      where: { userId_courseId: { userId: user.id, courseId: lesson.courseId } },
      update: {},
      create: {
        userId: user.id,
        courseId: lesson.courseId,
        certificateCode: `CERT-${Date.now()}`,
      },
    })
  }

  return NextResponse.json({ progress: progressPct, certification })
}
