import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = { params: { id: string } }

export async function POST(_: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  await prisma.postLike.upsert({
    where: { userId_postId: { userId: user.id, postId: params.id } },
    update: {},
    create: { userId: user.id, postId: params.id },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  await prisma.postLike.deleteMany({
    where: { userId: user.id, postId: params.id },
  })

  return NextResponse.json({ ok: true })
}
