import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const avatarSchema = z
  .string()
  .url()
  .or(z.string().startsWith("data:image"))
  .optional()

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: avatarSchema,
})

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, bio, avatarUrl } = parsed.data

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name ?? undefined,
      profile: {
        upsert: {
          create: { bio, avatarUrl },
          update: { bio, avatarUrl },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      profile: { select: { bio: true, avatarUrl: true } },
    },
  })

  return NextResponse.json({ user: updated })
}
