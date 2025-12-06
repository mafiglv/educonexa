import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import EventsClient, { type EventItem } from "./events-client"

export const metadata: Metadata = {
  title: "Eventos",
}

export default async function EventsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const now = new Date()
  const eventsData = await prisma.post.findMany({
    where: { eventDate: { not: null, gte: now } },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
    orderBy: { eventDate: "asc" },
    take: 50,
  })

  const events: EventItem[] = eventsData.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.content,
    eventDate: e.eventDate!.toISOString(),
    eventLocation: e.eventLocation ?? undefined,
    mediaUrl: e.mediaUrl ?? undefined,
    createdAt: e.createdAt.toISOString(),
    author: {
      id: e.author.id,
      name: e.author.name,
      email: e.author.email,
    },
  }))

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <EventsClient currentUserId={user.id} initialEvents={events} />
      <BottomNav />
    </div>
  )
}
