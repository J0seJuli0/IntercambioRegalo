'use client';
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Gift as GiftType } from "@/lib/types";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // TODO: Replace with real assignment data
  const assignment = null; 
  const receiver = null;

  const wishlistQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/wishlistItems`);
  }, [firestore, user]);

  const { data: userWishlist, isLoading: isWishlistLoading } = useCollection<GiftType>(wishlistQuery);

  if (isUserLoading) {
    return (
       <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="h-48 lg:col-span-4" />
          <Skeleton className="h-48 lg:col-span-3" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          ¡Hola, {user.displayName || user.email}! 👋
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Tu Amigo Secreto Es...</CardTitle>
            <CardDescription>
              Este año, te ha tocado regalarle a:
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            {receiver ? (
              <>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://picsum.photos/seed/${receiver.id}/100/100`} data-ai-hint="person face" />
                  <AvatarFallback>{receiver.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-2xl font-bold">{receiver.name}</p>
                  <p className="text-muted-foreground">¡Hora de investigar su lista de deseos!</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center text-center p-4 bg-secondary rounded-lg w-full">
                <p className="text-muted-foreground">Tu amigo secreto aún no ha sido asignado. ¡Vuelve pronto!</p>
              </div>
            )}
          </CardContent>
          {receiver && (
            <CardFooter>
              <Button asChild>
                <Link href={`/participants/${receiver.id}`}>
                  Ver Lista de Deseos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Tu Lista de Deseos</CardTitle>
            <CardDescription>
              Un vistazo rápido a los regalos que has pedido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isWishlistLoading ? (
               <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
            ) : userWishlist && userWishlist.length > 0 ? (
              <ul className="space-y-2">
                {userWishlist.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-primary" />
                    <span>{item.name}</span>
                    {item.isPurchased && <Badge variant="secondary">Comprado</Badge>}
                  </li>
                ))}
              </ul>
            ) : (
               <p className="text-muted-foreground">Aún no has añadido nada a tu lista.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
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
