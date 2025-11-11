'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
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
import { useFirestore, setDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { firebaseConfig } from "@/firebase/config";
import { initializeApp, getApps } from "firebase/app";

// Create a secondary Firebase app instance to manage user creation
// This avoids conflicts with the main app's authentication state.
const adminApp = !getApps().some(app => app.name === 'admin-sdk') 
  ? initializeApp(firebaseConfig, 'admin-sdk') 
  : getApps().find(app => app.name === 'admin-sdk')!;

const adminAuth = getAuth(adminApp);

const formSchema = z.object({
  fullName: z.string().min(1, { message: "El nombre completo es requerido." }),
  email: z.string().email({ message: "Por favor ingresa un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export default function RegisterUserPage() {
  const firestore = useFirestore();
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
      const userCredential = await createUserWithEmailAndPassword(adminAuth, values.email, values.password);
      const user = userCredential.user;

      // Create user document in Firestore with 'user' role
      const userRef = doc(firestore, "users", user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        name: values.fullName,
        email: user.email,
        profilePictureUrl: null,
        tipo_user: 1, // Assign 'user' role (1) by default
      }, { merge: false });
      
      toast({
        title: "¡Usuario Creado!",
        description: `La cuenta para ${values.fullName} ha sido creada exitosamente.`,
      });

      // Reset form after successful creation
      form.reset();

    } catch (error: any) {
      console.error("Admin User Creation Error:", error.code, error.message);
      let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Este correo electrónico ya está en uso.";
      }
      toast({
        variant: "destructive",
        title: "Error al crear usuario",
        description,
      });
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <h2 className="text-3xl font-bold tracking-tight font-headline">
          Registrar Nuevo Usuario
        </h2>
        <Card className="mx-auto max-w-2xl">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">Crear Cuenta</CardTitle>
            <CardDescription>
            Crea una nueva cuenta de usuario para la aplicación.
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
                        <Input placeholder="Nombre del usuario" {...field} />
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
                        <Input placeholder="usuario@ejemplo.com" {...field} />
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
                    <FormLabel>Contraseña Temporal</FormLabel>
                    <FormControl>
                        <Input type="password" {...field} />
                    </FormControl>
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
        </CardContent>
        </Card>
    </div>
  )
}
