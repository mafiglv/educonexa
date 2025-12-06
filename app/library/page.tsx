import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Download, Search } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

const resources = [
  {
    id: 1,
    title: "Detrave seu Cérebro",
    type: "PDF",
    category: "Desenvolvimento pessoal",
    url: "https://cdn.bookey.app/files/pdf/book/pt/destrave-seu-c%C3%A9rebro.pdf",
  },
  {
    id: 2,
    title: "Matemática: 8º ano",
    type: "PDF",
    category: "Matemática",
    url: "https://acervodigital.sme.prefeitura.sp.gov.br/wp-content/uploads/2025/09/CadernosApoioAprendizagemMatematicaAluno8Ano.pdf",
  },
]

export const metadata: Metadata = {
  title: "Biblioteca",
}

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 lg:p-10 text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">Biblioteca</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-white/60" />
            <Input
              placeholder="Buscar recursos..."
              className="pl-10 md:pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 h-10 md:h-12 text-sm md:text-base"
            />
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 lg:p-10 space-y-4 md:space-y-6 max-w-4xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge variant="default" className="bg-accent text-accent-foreground whitespace-nowrap text-xs md:text-sm">
            Todos
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap text-xs md:text-sm">
            PDFs
          </Badge>
        </div>

        <div className="space-y-3 md:space-y-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="border-border/50 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <CardTitle className="text-base md:text-lg lg:text-xl leading-tight">{resource.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs md:text-sm whitespace-nowrap">
                        {resource.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs md:text-sm">{resource.category}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
                  <span>Material para download</span>
                  <a
                    className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="h-3 w-3 md:h-4 md:w-4" />
                    Baixar
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
