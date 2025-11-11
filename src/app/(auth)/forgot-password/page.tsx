import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <Logo className="mb-4 justify-center" />
        <CardTitle className="text-2xl font-headline">Recuperar Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Enviar Código
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          ¿Recordaste tu contraseña?{" "}
          <Link href="/login" className="underline">
            Inicia Sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
