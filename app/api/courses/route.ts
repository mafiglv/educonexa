import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
})

export async function GET() {
  const courses = await prisma.course.findMany({
    include: {
      author: { select: { id: true, name: true, email: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ courses })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = courseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        authorId: user.id,
      },
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro ao criar curso" }, { status: 500 })
  }
}
