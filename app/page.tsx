import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary to-secondary p-6">
      <div className="w-full max-w-md lg:max-w-lg space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative h-28 w-72 md:h-32 md:w-80 lg:h-36 lg:w-96">
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
          <h1 className="text-balance text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-sm">
            Bem-vindo ao EDUCONEXA
          </h1>
          <p className="text-pretty text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">
            Promovendo a inclusão educacional através da colaboração e do engajamento social
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-8">
          <Link href="/login" className="block">
            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg md:text-xl font-semibold h-12 md:h-14 border-2 border-white"
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
              Criar conta
            </Button>
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-sm md:text-base text-white/80 pt-4">
          Uma iniciativa para familiares, amigos e população em geral
        </p>
      </div>
    </div>
  )
}
export const metadata = {
  title: "Boas-vindas",
}
