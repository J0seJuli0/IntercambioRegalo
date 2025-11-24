'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { doc } from 'firebase/firestore';


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
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, KeyRound } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  fullName: z.string().min(1, { message: "El nombre completo es requerido." }),
  email: z.string().email({ message: "Por favor ingresa un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  tipo_user: z.coerce.number().min(1).max(2, "Tipo de usuario inválido"),
  admin_password: z.string().min(1, { message: "Tu contraseña de admin es requerida."}),
});

async function reSignInAdmin(auth: Auth, adminEmail: string, adminPass: string) {
  await signInWithEmailAndPassword(auth, adminEmail, adminPass);
}

export default function RegisterUserPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      tipo_user: 1,
      admin_password: ""
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const adminUser = auth.currentUser;
    if (!adminUser || !adminUser.email) {
       toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "No se pudo verificar la sesión del administrador.",
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const userRef = doc(firestore, "users", user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        name: values.fullName,
        email: user.email,
        profilePictureUrl: null,
        tipo_user: values.tipo_user,
      }, { merge: false });
      
      toast({
        title: "¡Usuario Creado!",
        description: `La cuenta para ${values.fullName} ha sido creada exitosamente.`,
      });

      // Re-login as admin
      await reSignInAdmin(auth, adminUser.email, values.admin_password);

      form.reset();

    } catch (error: any) {
      console.error("Admin User Creation Error:", error.code, error.message);
      let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Este correo electrónico ya está en uso.";
      } else if (error.code === 'auth/weak-password') {
         description = "La contraseña es demasiado débil.";
      }
      
      // Attempt to re-login admin even if user creation fails to keep the session
      try {
         await reSignInAdmin(auth, adminUser.email, values.admin_password);
      } catch (reLoginError) {
         console.error("Failed to re-login admin:", reLoginError);
         description += " Hubo un problema al restaurar tu sesión de admin.";
      }

      toast({
        variant: "destructive",
        title: "Error al crear usuario",
        description,
      });
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] lg:grid lg:grid-cols-2">
      <div className="hidden bg-muted lg:flex items-center justify-center p-8">
        <Image
          src="https://picsum.photos/seed/admin-welcome/600/800"
          alt="Imagen de bienvenida"
          data-ai-hint="office team"
          width={600}
          height={800}
          className="rounded-lg object-cover aspect-[3/4]"
        />
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Registrar Nuevo Usuario</h1>
            <p className="text-balance text-muted-foreground">
              Completa el formulario para añadir un nuevo miembro a la plataforma.
            </p>
          </div>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                       <div className="relative">
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <FormControl>
                            <Input placeholder="Nombre del usuario" {...field} className="pl-9" />
                          </FormControl>
                       </div>
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
                       <div className="relative">
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <FormControl>
                            <Input placeholder="usuario@ejemplo.com" {...field} className="pl-9" />
                          </FormControl>
                       </div>
                      <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña Temporal (para el nuevo usuario)</FormLabel>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                            <Input type="password" {...field} className="pl-9" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="admin_password"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tu Contraseña de Administrador</FormLabel>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                            <Input type="password" {...field} className="pl-9" placeholder="Ingresa tu propia contraseña" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                  control={form.control}
                  name="tipo_user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Usuario</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Usuario</SelectItem>
                          <SelectItem value="2">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-4" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Usuario
                </Button>
            </form>
            </Form>
        </div>
      </div>
    </div>
  )
}
