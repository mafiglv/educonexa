import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  eventDate: z.string().datetime(),
  eventLocation: z.string().min(1),
  mediaUrl: z.string().url().or(z.string().startsWith("data:")).optional(),
})

export async function GET(req: NextRequest) {
  const fromParam = req.nextUrl.searchParams.get("from")
  const toParam = req.nextUrl.searchParams.get("to")

  const dateFilter: { not: null; gte?: Date; lte?: Date } = { not: null }
  const now = new Date()

  if (fromParam) {
    const from = new Date(fromParam)
    if (!Number.isNaN(from.getTime())) {
      dateFilter.gte = from
    }
  } else {
    dateFilter.gte = now
  }

  if (toParam) {
    const to = new Date(toParam)
    if (!Number.isNaN(to.getTime())) {
      dateFilter.lte = to
    }
  }

  const events = await prisma.post.findMany({
    where: { eventDate: dateFilter },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
    orderBy: { eventDate: "asc" },
  })

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.content,
      eventDate: e.eventDate!.toISOString(),
      eventLocation: e.eventLocation,
      mediaUrl: e.mediaUrl ?? undefined,
      createdAt: e.createdAt.toISOString(),
      author: {
        id: e.author.id,
        name: e.author.name,
        email: e.author.email,
      },
    })),
  })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const event = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.description,
      eventDate: new Date(parsed.data.eventDate),
      eventLocation: parsed.data.eventLocation,
      mediaUrl: parsed.data.mediaUrl,
      authorId: user.id,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(
    {
      event: {
        id: event.id,
        title: event.title,
        description: event.content,
        eventDate: event.eventDate!.toISOString(),
        eventLocation: event.eventLocation,
        mediaUrl: event.mediaUrl ?? undefined,
        createdAt: event.createdAt.toISOString(),
        author: {
          id: event.author.id,
          name: event.author.name,
          email: event.author.email,
        },
      },
    },
    { status: 201 },
  )
}
