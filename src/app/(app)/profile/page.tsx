'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User as UserIcon, Image as ImageIcon, Link as LinkIcon, RefreshCcw } from "lucide-react";
import Image from "next/image";

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "../loading";
import { useEffect, useState } from "react";

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Correo electrónico inválido."),
  profilePictureUrl: z.string().url("URL inválida").optional().or(z.literal('')),
});

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      profilePictureUrl: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.displayName || "",
        email: user.email || "",
        profilePictureUrl: user.photoURL || "",
      });
      setAvatarPreview(user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`);
    }
  }, [user, form]);
  
  const handleProfileUpdate = async (name: string, photoURL?: string) => {
     if (!user || !auth.currentUser) return;
     try {
       const userRef = doc(firestore, "users", user.uid);
       const updateData: { name: string; profilePictureUrl?: string } = { name };
        if (photoURL) {
         updateData.profilePictureUrl = photoURL;
       }
       
       await updateProfile(auth.currentUser, { 
         displayName: name,
         ...(photoURL && { photoURL }),
       });

       setDocumentNonBlocking(userRef, updateData, { merge: true });

     } catch (error: any) {
        console.error("Error updating profile data: ", error);
        throw new Error("No se pudo actualizar la información del perfil.");
     }
  }

  const handleUrlSubmit = async () => {
    const url = form.getValues("profilePictureUrl");
    if (url && z.string().url().safeParse(url).success) {
      setIsUploading(true);
      try {
        await handleProfileUpdate(form.getValues("name"), url);
        setAvatarPreview(url);
        toast({
          title: "¡Avatar actualizado!",
          description: "Tu foto de perfil ha sido cambiada.",
        });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      } finally {
        setIsUploading(false);
      }
    } else {
        form.setError("profilePictureUrl", { type: "manual", message: "Por favor, introduce una URL válida." });
    }
  };

  const handleAvatarGenerate = async () => {
     if (!user) return;
     const url = `https://avatar.vercel.sh/${user.uid}.png?username=${encodeURIComponent(user.displayName || user.email || 'user')}&time=${Date.now()}`;
     setIsUploading(true);
      try {
        await handleProfileUpdate(form.getValues("name"), url);
        setAvatarPreview(url);
        toast({
          title: "¡Avatar generado!",
          description: "Tu nuevo avatar ha sido asignado.",
        });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      } finally {
        setIsUploading(false);
      }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const storage = getStorage();
    const storageRef = ref(storage, `profilePictures/${user.uid}/${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await handleProfileUpdate(form.getValues("name"), downloadURL);
      setAvatarPreview(downloadURL);
      form.setValue("profilePictureUrl", downloadURL);

      toast({
        title: "¡Foto subida!",
        description: "Tu foto de perfil ha sido actualizada.",
      });

    } catch (error: any) {
      console.error("Error uploading file:", error);
       toast({
        variant: "destructive",
        title: "Error al subir",
        description: "No se pudo subir la imagen. Inténtalo de nuevo.",
      });
    } finally {
      setIsUploading(false);
    }
  };


  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (form.formState.isSubmitting) return;

    try {
      // We only update the name here, as photoURL is handled by its own buttons
      await handleProfileUpdate(values.name);
      toast({
        title: "Perfil actualizado",
        description: "Tu nombre ha sido guardado correctamente.",
      });
    } catch (error: any) {
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
      <div className="grid gap-6 md:grid-cols-3">
        <Form {...form}>
          <Card className="md:col-span-2">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu nombre y correo electrónico.
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
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>Elige cómo te verán los demás.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                 <Avatar className="h-32 w-32 border-4 border-primary/20">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Foto de perfil" data-ai-hint="person face" />
                  ) : null }
                  <AvatarFallback className="text-4xl">
                    <UserIcon />
                  </AvatarFallback>
                </Avatar>
              </div>

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload"><ImageIcon/></TabsTrigger>
                  <TabsTrigger value="url"><LinkIcon/></TabsTrigger>
                  <TabsTrigger value="avatar"><RefreshCcw/></TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="flex flex-col items-center gap-2 mt-4">
                  <Label htmlFor="picture" className="text-center text-sm text-muted-foreground">Sube una imagen desde tu dispositivo.</Label>
                  <Input id="picture" type="file" accept="image/*" onChange={handleFileUpload} className="text-xs" disabled={isUploading} />
                </TabsContent>
                <TabsContent value="url" className="space-y-2 mt-4">
                  <FormField
                      control={form.control}
                      name="profilePictureUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="https://ejemplo.com/imagen.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <Button onClick={handleUrlSubmit} className="w-full" disabled={isUploading}>Usar URL</Button>
                </TabsContent>
                <TabsContent value="avatar" className="flex flex-col items-center gap-2 mt-4">
                   <p className="text-center text-sm text-muted-foreground">Genera un avatar único basado en tu nombre.</p>
                   <Button onClick={handleAvatarGenerate} className="w-full" variant="secondary" disabled={isUploading}>Generar Avatar</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </Form>
      </div>
    </div>
  );
}
