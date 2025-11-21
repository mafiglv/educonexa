import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary to-secondary p-6">
      <div className="w-full max-w-md lg:max-w-lg space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative h-24 w-64 md:h-28 md:w-72 lg:h-32 lg:w-80">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-GzQBZ2wFuMhLZDI6Xi2if6kJEnF4xO.png"
              alt="EDUCONEXA"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-4">
          <h1 className="text-balance text-4xl md:text-5xl lg:text-6xl font-bold text-white">Bem-vindo ao EDUCONEXA</h1>
          <p className="text-pretty text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">
            Promovendo a inclusão educacional através da colaboração e engajamento social
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-8">
          <Link href="/login" className="block">
            <Button
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg md:text-xl font-semibold h-12 md:h-14"
            >
              Entrar
            </Button>
          </Link>
          <Link href="/login?signup=true" className="block">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-white text-white hover:bg-white/10 text-lg md:text-xl font-semibold bg-transparent h-12 md:h-14"
            >
              Criar Conta
            </Button>
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-sm md:text-base text-white/70 pt-4">
          Uma iniciativa para familiares, amigos e população em geral
        </p>
      </div>
    </div>
  )
}
