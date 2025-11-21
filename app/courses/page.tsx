import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import CoursesClient, { type CourseView } from "./courses-client"

const courseData = [
  {
    id: "course-adi-sub",
    title: "Adição e Subtração - Prof. Ferreto",
    description: "Fundamentos de operações básicas com foco em prática.",
    level: "Iniciante",
    lessons: [
      {
        id: "lesson-adi-sub-1",
        title: "Playlist completa",
        description: "Assista todos os vídeos da playlist.",
        videoUrl: "https://www.youtube.com/embed/videoseries?list=PLTPg64KdGgYhYpS5nXdFgdqEZDOS5lARB",
      },
    ],
  },
  {
    id: "course-libras",
    title: "Curso de Libras para iniciantes - Academia de Libras",
    description: "Aprenda Libras desde o alfabeto até frases úteis.",
    level: "Iniciante",
    lessons: [
      {
        id: "lesson-libras-1",
        title: "Playlist completa",
        description: "Assista todos os vídeos da playlist.",
        videoUrl: "https://www.youtube.com/embed/videoseries?list=PL8eRdbSEC-1lKAl3SEaFezjDPg2BPgSCe",
      },
    ],
  },
  {
    id: "course-gramatica",
    title: "Gramática do Zero - Janaina Souto",
    description: "Gramática aplicada com exemplos e exercícios.",
    level: "Intermediário",
    lessons: [
      {
        id: "lesson-gram-1",
        title: "Playlist completa",
        description: "Assista todos os vídeos da playlist.",
        videoUrl: "https://www.youtube.com/embed/videoseries?list=PL6u21MI1Ial69lDMNhzhRcJjjbwtk8WCk",
      },
    ],
  },
]

export default async function CoursesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  // Garantir cursos e aulas
  await Promise.all(
    courseData.map((course) =>
      prisma.course.upsert({
        where: { id: course.id },
        update: {},
        create: {
          id: course.id,
          title: course.title,
          description: course.description,
          status: "PUBLISHED",
          lessons: {
            createMany: {
              data: course.lessons.map((lesson, index) => ({
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
                videoUrl: lesson.videoUrl,
                order: index + 1,
              })),
              skipDuplicates: true,
            },
          },
        },
      }),
    ),
  )

  const courses = await prisma.course.findMany({
    where: { id: { in: courseData.map((c) => c.id) } },
    include: {
      lessons: { orderBy: { order: "asc" } },
      enrollments: { where: { userId: user.id } },
    },
    orderBy: { title: "asc" },
  })

  const view: CourseView[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    level: courseData.find((d) => d.id === c.id)?.level ?? "Iniciante",
    lessons: c.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description ?? "",
      videoUrl: l.videoUrl ?? "",
    })),
    progress: c.enrollments[0]?.progress ?? 0,
  }))

  return <CoursesClient courses={view} />
}
