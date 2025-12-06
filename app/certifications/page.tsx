import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/bottom-nav"
import QuizClient from "./quiz-client"

const quizCourses = [
  {
    id: "course-adi-sub",
    title: "Adição e Subtração",
    description: "Fundamentos matemáticos com exercícios.",
    question: "Quanto é 12 + 8?",
    answer: "20",
  },
  {
    id: "course-libras",
    title: "Libras para iniciantes",
    description: "Comunicação básica em Libras.",
    question: "Qual é a sigla usada para a língua de sinais no Brasil?",
    answer: "libras",
  },
  {
    id: "course-gramatica",
    title: "Gramática do Zero",
    description: "Conceitos essenciais de gramática.",
    question: "Complete: 'Ele ____ ao mercado.'",
    answer: "foi",
  },
]

export const metadata: Metadata = {
  title: "Certificados",
}

export default async function CertificationsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  // Garante cursos para certificados
  await Promise.all(
    quizCourses.map((c) =>
      prisma.course.upsert({
        where: { id: c.id },
        update: {},
        create: { id: c.id, title: c.title, description: c.description, status: "PUBLISHED" },
      }),
    ),
  )

  const myCerts = await prisma.certification.findMany({
    where: { userId: user.id },
    include: { course: { select: { title: true } } },
    orderBy: { issuedAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 lg:p-10 text-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Certificados</h1>
          <p className="text-white/90 text-sm md:text-base lg:text-lg">Responda ao quiz para gerar o certificado.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8 max-w-5xl mx-auto">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizCourses.map((course) => (
            <Card key={course.id} className="border-border/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg md:text-xl">{course.title}</CardTitle>
                  <Badge>Quiz</Badge>
                </div>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <QuizClient courseId={course.id} question={course.question} answer={course.answer} />
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Meus certificados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myCerts.length === 0 && <p className="text-sm text-muted-foreground">Nenhum certificado ainda.</p>}
            {myCerts.map((cert) => (
              <div key={cert.id} className="border border-border/50 rounded px-3 py-2 flex justify-between text-sm">
                <div>
                  <p className="font-semibold">{cert.course.title}</p>
                  <p className="text-muted-foreground">Código: {cert.certificateCode}</p>
                </div>
                <span className="text-muted-foreground">
                  {cert.issuedAt.toLocaleDateString("pt-BR")}{" "}
                  {cert.issuedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}
