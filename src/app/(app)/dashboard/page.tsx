'use client';
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import Image from 'next/image';
import { useUser } from "@/firebase";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  // TODO: Replace with real data from Firestore
  const assignment = null; //getAssignmentForGiver(currentUserId);
  const receiver = null; //assignment ? getUserById(assignment.receiverId) : null;
  const userWishlist: any[] = []; //getWishlistByUserId(currentUserId);

  if (isUserLoading) {
    return <div>Cargando...</div>;
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
              <p>Tu amigo secreto aún no ha sido asignado. ¡Vuelve pronto!</p>
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
            {userWishlist.length > 0 ? (
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
