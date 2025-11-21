import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = { params: { id: string } }

export async function POST(_: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }
  if (user.id === params.id) {
    return NextResponse.json({ error: "Você não pode seguir a si mesmo" }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  const follow = await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: user.id, followingId: params.id } },
    update: {},
    create: { followerId: user.id, followingId: params.id },
    include: {
      follower: { select: { id: true, name: true } },
      following: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ follow })
}

export async function DELETE(_: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  await prisma.follow.deleteMany({
    where: { followerId: user.id, followingId: params.id },
  })

  return NextResponse.json({ ok: true })
}
