'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User as UserIcon, Image as ImageIcon, Link as LinkIcon, Lock } from "lucide-react";

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
import { useEffect, useState, useRef } from "react";

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Correo electrónico inválido."),
  profilePictureUrl: z.string().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida."),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      profilePictureUrl: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    }
  });


  useEffect(() => {
    if (user) {
      // We need to fetch the full user doc from firestore to get the base64 url
       const userRef = doc(firestore, "users", user.uid);
       const unsub = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
           const initialValues = {
            name: user.displayName || userData.name || "",
            email: user.email || "",
            profilePictureUrl: userData.profilePictureUrl || user.photoURL || "",
          };
          profileForm.reset(initialValues);
          setAvatarPreview(userData.profilePictureUrl || user.photoURL);
        }
       });

       return () => unsub();
    }
  }, [user, profileForm, firestore]);
  
  const handleProfileUpdate = async (name: string, photoURL?: string) => {
     if (!user || !auth.currentUser) return;
     try {
       const userRef = doc(firestore, "users", user.uid);
       const updateData: { name: string; profilePictureUrl?: string } = { name };
        if (photoURL !== undefined) { 
         updateData.profilePictureUrl = photoURL;
       }
       
       await updateProfile(auth.currentUser, { 
         displayName: name,
       });

       setDocumentNonBlocking(userRef, updateData, { merge: true });

     } catch (error: any) {
        console.error("Error updating profile data: ", error);
        throw new Error("No se pudo actualizar la información del perfil.");
     }
  }

  const handleUrlSubmit = async () => {
    const url = profileForm.getValues("profilePictureUrl");
    if (url && z.string().url().safeParse(url).success) {
      setIsUploading(true);
      try {
        await handleProfileUpdate(profileForm.getValues("name"), url);
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
        profileForm.setError("profilePictureUrl", { type: "manual", message: "Por favor, introduce una URL válida." });
    }
  };


 const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Limit file size to prevent very large base64 strings
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Archivo demasiado grande",
          description: "Por favor, elige una imagen de menos de 2MB.",
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);

    const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    try {
      const base64String = await toBase64(selectedFile);
      
      await handleProfileUpdate(profileForm.getValues("name"), base64String);
      setAvatarPreview(base64String);
      profileForm.setValue("profilePictureUrl", base64String);

      toast({
        title: "¡Foto subida!",
        description: "Tu foto de perfil ha sido actualizada.",
      });
      setSelectedFile(null); 
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

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


  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (profileForm.formState.isSubmitting) return;

    try {
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

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      toast({ variant: "destructive", title: "Error", description: "No se encontró el usuario actual." });
      return;
    }
    
    try {
      // 1. Re-authenticate user for security
      const credential = EmailAuthProvider.credential(auth.currentUser.email, values.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // 2. Update password
      await updatePassword(auth.currentUser, values.newPassword);
      
      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido cambiada exitosamente.",
      });
      passwordForm.reset();

    } catch (error: any) {
        let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
        if (error.code === 'auth/wrong-password') {
            description = "La contraseña actual es incorrecta.";
            passwordForm.setError("currentPassword", { type: "manual", message: description });
        } else if (error.code === 'auth/weak-password') {
            description = "La nueva contraseña es demasiado débil.";
            passwordForm.setError("newPassword", { type: "manual", message: description });
        }
        console.error("Password Update Error:", error);
        toast({
            variant: "destructive",
            title: "Error al cambiar la contraseña",
            description: description,
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
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
             <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tu nombre y correo electrónico.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FormField
                      control={profileForm.control}
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
                      control={profileForm.control}
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
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </form>
            </Form>
            </Card>
        </TabsContent>
        <TabsContent value="avatar">
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

                <Tabs defaultValue="upload" className="w-full max-w-sm">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload"><ImageIcon/> Subir</TabsTrigger>
                    <TabsTrigger value="url"><LinkIcon/> Enlace</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="flex flex-col items-center gap-2 mt-4">
                    <Label htmlFor="picture" className="text-center text-sm text-muted-foreground">Sube una imagen desde tu dispositivo.</Label>
                    <Input id="picture" type="file" accept="image/*" onChange={handleFileSelect} className="text-xs" disabled={isUploading} ref={fileInputRef}/>
                    {selectedFile && (
                        <Button onClick={handleFileUpload} className="w-full mt-2" disabled={isUploading}>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar Imagen
                        </Button>
                    )}
                </TabsContent>
                <TabsContent value="url" className="space-y-2 mt-4">
                    <Form {...profileForm}>
                    <FormField
                        control={profileForm.control}
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
                    </Form>
                    <Button onClick={handleUrlSubmit} className="w-full" disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar URL
                    </Button>
                </TabsContent>
                </Tabs>
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="security">
             <Card>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                        <CardHeader>
                            <CardTitle>Cambiar Contraseña</CardTitle>
                            <CardDescription>Actualiza tu contraseña. Por seguridad, se te pedirá tu contraseña actual.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña Actual</FormLabel>
                                    <FormControl>
                                    <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva Contraseña</FormLabel>
                                    <FormControl>
                                    <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                                    <FormControl>
                                    <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cambiar Contraseña
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
             </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    