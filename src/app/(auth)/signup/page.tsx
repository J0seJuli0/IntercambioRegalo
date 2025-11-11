'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Logo from "@/components/Logo";
import { useAuth, useFirestore, setDocumentNonBlocking, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";


const formSchema = z.object({
  fullName: z.string().min(1, { message: "El nombre completo es requerido." }),
  email: z.string().email({ message: "Por favor ingresa un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 1. Update Firebase Auth profile
      await updateProfile(user, { displayName: values.fullName });

      // 2. Create user document in Firestore
      const userRef = doc(firestore, "users", user.uid);
      // Using setDocumentNonBlocking here is fine, as the user is already created
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        name: values.fullName,
        email: user.email,
        profilePictureUrl: user.photoURL,
      }, { merge: false });
      
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente. Redirigiendo...",
      });

      // Redirect manually as the useUser hook might take a moment to update
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Signup Error:", error.code, error.message);
      let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Este correo electrónico ya está en uso. Intenta iniciar sesión.";
      }
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description,
      });
    }
  }

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu Nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </form>
        </Form>
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
