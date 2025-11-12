'use client';
import Link from "next/link";
import { ArrowRight, Gift, Users, Star, CalendarClock, PartyPopper } from "lucide-react";
import { useUser, useFirestore, useCollection, useDoc, setDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Gift as GiftType, User, ExchangeParticipant } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import { assignSecretSanta } from "@/ai/flows/assign-secret-santa";
import { runFlow } from "@genkit-ai/next/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDrawing, setIsDrawing] = useState(false);

  // --- Data Fetching ---

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<User>(userDocRef);

  const exchange = { id: "global-exchange", name: "Intercambio Navideño 2025", budget: 50 };

  const assignmentDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `giftExchanges/${exchange.id}/participants`, user.uid);
  }, [firestore, user, exchange.id]);

  const { data: assignment, isLoading: isAssignmentLoading } = useDoc<ExchangeParticipant>(assignmentDocRef);

  const receiverDocRef = useMemoFirebase(() => {
    if (!assignment?.targetUserId) return null;
    return doc(firestore, 'users', assignment.targetUserId);
  }, [firestore, assignment]);

  const { data: receiver, isLoading: isReceiverLoading } = useDoc<User>(receiverDocRef);

  const allUsersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: allUsers } = useCollection<User>(allUsersQuery);

  const wishlistQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/wishlistItems`);
  }, [firestore, user]);

  const { data: userWishlist, isLoading: isWishlistLoading } = useCollection<GiftType>(wishlistQuery);
  
  const receiverWishlistQuery = useMemoFirebase(() => {
    if (!receiver) return null;
    return collection(firestore, `users/${receiver.id}/wishlistItems`);
  }, [firestore, receiver]);

  const { data: receiverWishlist } = useCollection<GiftType>(receiverWishlistQuery);


  // --- Calculations ---

  const totalItems = userWishlist?.length || 0;
  const purchasedItemsCount = receiverWishlist?.filter(item => item.isPurchased).length || 0;
  const totalReceiverItems = receiverWishlist?.length || 0;
  const purchaseProgress = totalReceiverItems > 0 ? (purchasedItemsCount / totalReceiverItems) * 100 : 0;
  
  const getNextDrawDate = () => {
    const now = new Date();
    let drawDate = new Date(now.getFullYear(), 11, 1); // December 1st
    if (now > drawDate) {
      drawDate = new Date(now.getFullYear() + 1, 11, 1);
    }
    return drawDate;
  };

  const drawDate = getNextDrawDate();

  // --- Handlers ---
  
  const handleDraw = async () => {
    if (!allUsers || allUsers.length < 2) {
      toast({ variant: "destructive", title: "No hay suficientes usuarios", description: "Se necesitan al menos 2 participantes para el sorteo." });
      return;
    }
    setIsDrawing(true);
    try {
      const result = await runFlow(assignSecretSanta, { 
        userIds: allUsers.map(u => u.id),
        exchangeId: exchange.id
      });
      
      if (result && result.assignments) {
        // The flow returns assignments, now we save them from the client
        for (const assignment of result.assignments) {
            if(assignment.giverId && assignment.receiverId) {
                const participantRef = doc(firestore, `giftExchanges/${exchange.id}/participants/${assignment.giverId}`);
                setDocumentNonBlocking(participantRef, {
                    userId: assignment.giverId,
                    giftExchangeId: exchange.id,
                    targetUserId: assignment.receiverId
                }, { merge: true });
            }
        }
        toast({ title: "¡Sorteo Realizado!", description: "Las asignaciones se han completado. ¡Refresca para ver los resultados!" });
      } else {
        throw new Error("El sorteo no devolvió asignaciones.");
      }

    } catch (error) {
      console.error("Draw error:", error);
      toast({ variant: "destructive", title: "Error en el sorteo", description: "No se pudo completar la asignación." });
    } finally {
      setIsDrawing(false);
    }
  };

  if (isUserLoading || isAssignmentLoading || isReceiverLoading) {
    return (
       <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
           <Skeleton className="h-64 lg:col-span-3" />
           <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Should be redirected by layout
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          ¡Hola, {user.displayName || user.email}! 👋
        </h2>
         {userProfile?.tipo_user === 2 && (
            <Button onClick={handleDraw} disabled={isDrawing}>
              {isDrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PartyPopper className="mr-2 h-4 w-4" />}
              Realizar Sorteo
            </Button>
          )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col justify-center items-center bg-gradient-to-br from-primary to-red-400 text-primary-foreground">
          <CardHeader className="text-center pb-2">
             <CardTitle className="text-2xl font-headline">Sorteo del Amigo Secreto</CardTitle>
            <CardDescription className="text-primary-foreground/80">Tiempo restante para la asignación</CardDescription>
          </CardHeader>
          <CardContent className="p-4 w-full flex justify-center">
            <CountdownTimer targetDate={drawDate} />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tu Amigo Secreto</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {receiver ? (
                  <div className="text-2xl font-bold">{receiver.name}</div>
                 ) : (
                    <div className="text-xl font-bold">Por Asignar</div>
                 )}
                <p className="text-xs text-muted-foreground">
                   {receiver ? '¡Es hora de ver su lista!' : 'Pronto sabrás a quién regalar'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tu Lista de Deseos</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems} {totalItems === 1 ? 'Regalo' : 'Regalos'}</div>
                <p className="text-xs text-muted-foreground">
                  Tienes {totalItems} regalos en tu lista.
                </p>
              </CardContent>
            </Card>
             <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progreso de Compra (para tu amigo)</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{purchasedItemsCount} de {totalReceiverItems}</div>
                <Progress value={purchaseProgress} className="mt-2 h-2" />
              </CardContent>
            </Card>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Tu Intercambio: {exchange.name}</CardTitle>
            <CardDescription>
              Presupuesto: ${exchange.budget}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            {receiver ? (
              <>
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={receiver.profilePictureUrl || `https://picsum.photos/seed/${receiver.id}/100/100`} data-ai-hint="person face" />
                  <AvatarFallback>{receiver.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-2xl font-bold">{receiver.name}</p>
                  <p className="text-muted-foreground">¡Hora de investigar su lista de deseos!</p>
                   <Button asChild className="mt-2">
                    <Link href={`/participants/${receiver.id}`}>
                      Ver Lista <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-secondary rounded-lg w-full">
                 <CalendarClock className="h-10 w-10 text-muted-foreground mb-3"/>
                <p className="text-lg font-semibold">Tu amigo secreto aún no ha sido asignado.</p>
                <p className="text-muted-foreground mt-1">El sorteo está en proceso. ¡Vuelve pronto para la gran revelación!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Mi Lista de Deseos</CardTitle>
             <CardDescription>
              {totalItems > 0 ? `Tus ${totalItems} regalos más deseados.` : "Añade regalos a tu lista."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isWishlistLoading ? (
               <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
            ) : userWishlist && userWishlist.length > 0 ? (
              <ul className="space-y-4">
                {userWishlist.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
               <p className="text-muted-foreground text-center py-4">Aún no has añadido nada a tu lista.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/wishlist">
                Gestionar mi Lista
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
