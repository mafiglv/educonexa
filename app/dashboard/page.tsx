import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Library, Award, Users, MessageSquare } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const [coursesCount, resourcesCount, certificationsCount] = await Promise.all([
    prisma.enrollment.count({ where: { userId: user.id } }),
    prisma.resource.count({ where: { course: { enrollments: { some: { userId: user.id } } } } }),
    prisma.certification.count({ where: { userId: user.id } }),
  ])

  const quickActions = [
    {
      title: "Feed de notícias",
      description: "Últimas atualizações e novidades",
      icon: MessageSquare,
      href: "/feed",
      color: "bg-accent/10 text-accent-foreground",
    },
    {
      title: "Cursos",
      description: "Explore cursos e módulos",
      icon: BookOpen,
      href: "/courses",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Biblioteca",
      description: "Recursos e materiais",
      icon: Library,
      href: "/library",
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Eventos",
      description: "Palestras e oportunidades",
      icon: Calendar,
      href: "/events",
      color: "bg-accent/10 text-accent-foreground",
    },
    {
      title: "Certificacoes",
      description: "Seus certificados",
      icon: Award,
      href: "/certifications",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Comunidade",
      description: "Fóruns e discussões",
      icon: Users,
      href: "/feed",
      color: "bg-secondary/10 text-secondary",
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 lg:p-10 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white">Olá, {user.name || user.email}!</h1>
          <p className="text-white/90 md:text-lg">Bem-vindo(a) ao EDUCONEXA</p>
        </div>
      </div>

      <div className="p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8 max-w-7xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Seu progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
              <div>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{coursesCount}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Cursos inscritos</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-accent">{resourcesCount}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Recursos liberados</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary">{certificationsCount}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 text-foreground">Acesso rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-border/50">
                  <CardContent className="p-4 md:p-6 flex flex-col items-center text-center gap-3 md:gap-4">
                    <div className={`p-3 md:p-4 rounded-full ${action.color}`}>
                      <action.icon className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm md:text-base mb-1">{action.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
