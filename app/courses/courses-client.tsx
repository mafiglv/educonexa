"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export type CourseView = {
  id: string
  title: string
  description: string
  level: string
  lessons: { id: string; title: string; description: string; videoUrl: string }[]
  progress: number
}

type Props = {
  courses: CourseView[]
}

export default function CoursesClient({ courses }: Props) {
  const [courseState, setCourseState] = useState(courses)

  const markLesson = async (lessonId: string, courseId: string) => {
    const res = await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" })
    if (!res.ok) return
    const data = await res.json()
    setCourseState((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, progress: data.progress ?? c.progress } : c)),
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 lg:p-10 text-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:3xl lg:text-4xl font-bold">Cursos</h1>
          <p className="text-white/90 text-sm md:text-base lg:text-lg">Playlists para assistir dentro da plataforma.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 lg:p-10 space-y-4 md:space-y-6 max-w-5xl mx-auto">
        {courseState.map((course) => (
          <Card key={course.id} className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 md:pb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="secondary" className="text-xs md:text-sm bg-primary/10 text-primary">
                  {course.level}
                </Badge>
                <Badge variant="outline" className="text-xs md:text-sm">
                  Playlist YouTube
                </Badge>
              </div>
              <CardTitle className="text-lg md:text-xl lg:text-2xl leading-tight flex items-start gap-2">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
                {course.title}
              </CardTitle>
              <CardDescription className="text-sm md:text-base leading-relaxed">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
                  <span>Progresso</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2 md:h-3" />
              </div>
              {course.lessons.map((lesson) => (
                <div key={lesson.id} className="space-y-2 border border-border/50 rounded-lg p-3">
                  <div className="font-semibold">{lesson.title}</div>
                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-border/60">
                    <iframe
                      src={lesson.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={lesson.title}
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => markLesson(lesson.id, course.id)}>
                    Marcar como assistido
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
