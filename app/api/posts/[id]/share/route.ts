import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = { params: { id: string } }

export async function POST(_: Request, { params }: Params) {
  const updated = await prisma.post.update({
    where: { id: params.id },
    data: { shareCount: { increment: 1 } },
    select: { id: true, shareCount: true },
  })

  return NextResponse.json({ post: updated })
}
