'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Loading from "../loading";
import { useEffect } from "react";

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Correo electrónico inválido."),
});

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.displayName || "",
        email: user.email || "",
      });
    }
  }, [user, form]);
  
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;

    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: values.name });

      // Update Firestore user document
      const userRef = doc(firestore, "users", user.uid);
      await setDoc(userRef, { name: values.name, email: values.email }, { merge: true });

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido guardada correctamente.",
      });

    } catch (error: any) {
      console.error("Error updating profile: ", error);
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message || "No se pudo guardar tu información.",
      });
    }
  };
  
  if (isUserLoading) {
    return <Loading />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">
        Mi Perfil
      </h2>
      <div className="grid gap-6">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu nombre y correo electrónico. El correo no se puede cambiar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                   <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input type="email" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>
              Gestiona cómo te notificamos. (Funcionalidad no implementada)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-muted-foreground">Notificaciones por Correo</Label>
              <Switch id="email-notifications" disabled />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="text-muted-foreground">Notificaciones Push</Label>
              <Switch id="push-notifications" disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
