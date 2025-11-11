import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Logo from "@/components/Logo"

export default function SignupPage() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <Logo className="mb-4 justify-center" />
        <CardTitle className="text-2xl font-headline">Regístrate</CardTitle>
        <CardDescription>
          Crea tu cuenta para empezar a organizar tu Amigo Secreto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full-name">Nombre Completo</Label>
            <Input id="full-name" placeholder="Tu Nombre" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" />
          </div>
          <Button type="submit" className="w-full">
            Crear Cuenta
          </Button>
           <Button variant="outline" className="w-full" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="underline">
            Inicia Sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
