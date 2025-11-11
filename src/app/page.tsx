import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { placeHolderImages } from '@/lib/placeholder-images';
import Logo from '@/components/Logo';

export default function Home() {
  const heroImage = placeHolderImages.find((img) => img.id === 'landing-hero');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Logo />
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Organiza tu Amigo Secreto sin Esfuerzo
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    GiftMatch hace que los intercambios de regalos sean divertidos y fáciles. Crea tu lista de deseos, descubre qué regalar y mantén la sorpresa hasta el final.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">
                      Iniciar Sesión
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                     <Link href="/signup">
                      Registrarse
                    </Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      data-ai-hint={heroImage.imageHint}
                      width={600}
                      height={400}
                      className="object-cover w-full h-auto aspect-[3/2]"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center py-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} GiftMatch. Todos los derechos reservados.
      </footer>
    </div>
  );
}