import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const roleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
})

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = roleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json({ user: updated })
}
