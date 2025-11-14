'use client';
import { useState } from "react";
import { useCollection, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PartyPopper, Users, Shuffle } from "lucide-react";
import type { User } from "@/lib/types";

// Type for the assignment object
type Assignment = {
  giverId: string;
  receiverId: string;
};

export default function AdminDrawPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDrawing, setIsDrawing] = useState(false);

  const allUsersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<User>(allUsersQuery);

  const exchange = { id: "global-exchange", name: "Intercambio Navideño 2025" };

 const performDraw = (users: User[]): Assignment[] => {
    // 1. Filter out any users without an ID, just in case.
    let participants = users.filter(u => u.id);
    const participantCount = participants.length;

    if (participantCount < 2) {
      return [];
    }
    
    // Create a mutable copy for shuffling
    let mutableParticipants = [...participants];

    // 2. Shuffle the participants array to ensure randomness
    for (let i = mutableParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mutableParticipants[i], mutableParticipants[j]] = [mutableParticipants[j], mutableParticipants[i]];
    }

    // 3. Create assignments in a circle (1 -> 2, 2 -> 3, ..., n -> 1)
    // This guarantees no one gets themselves.
    const assignments: Assignment[] = [];
    for (let i = 0; i < mutableParticipants.length; i++) {
      const giver = mutableParticipants[i];
      const receiver = mutableParticipants[(i + 1) % mutableParticipants.length]; // The next person in the circle
      assignments.push({
        giverId: giver.id,
        receiverId: receiver.id,
      });
    }

    return assignments;
  };

  const handleDraw = async () => {
    if (!allUsers || allUsers.length < 2) {
      toast({ variant: "destructive", title: "No hay suficientes usuarios", description: "Se necesitan al menos 2 participantes para el sorteo." });
      return;
    }
    setIsDrawing(true);
    try {
      const assignments = performDraw(allUsers);

      if (assignments.length === 0) {
        throw new Error("No se pudieron generar las asignaciones. Asegúrate de tener al menos 2 participantes.");
      }

      // Save assignments to Firestore
      for (const assignment of assignments) {
        if (assignment.giverId && assignment.receiverId) {
           const participantRef = doc(firestore, `giftExchanges/${exchange.id}/participants/${assignment.giverId}`);
           // Using the corrected ExchangeParticipant type structure
           setDocumentNonBlocking(participantRef, {
             id: assignment.giverId,
             giftExchangeId: exchange.id,
             giverId: assignment.giverId,
             receiverId: assignment.receiverId,
             // Keep these for backwards compatibility if needed, but the new ones are primary
             userId: assignment.giverId,
             targetUserId: assignment.receiverId,
           }, { merge: true });
        }
      }
      
      toast({ title: "¡Sorteo Realizado!", description: `Se han generado ${assignments.length} asignaciones con éxito.` });

    } catch (error) {
      console.error("Draw error:", error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo completar la asignación.";
      toast({ variant: "destructive", title: "Error en el sorteo", description: errorMessage });
    } finally {
      setIsDrawing(false);
    }
  };

  const participantCount = allUsers?.length || 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">
        Sorteo del Amigo Secreto
      </h2>
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Shuffle className="text-primary"/>
                Panel de Sorteo
            </CardTitle>
            <CardDescription>
              Desde aquí puedes iniciar la asignación aleatoria del amigo secreto para todos los participantes registrados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                 <Users className="h-6 w-6 text-muted-foreground"/>
                 <span className="font-medium">Participantes Registrados</span>
              </div>
              {isLoadingUsers ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="text-2xl font-bold">{participantCount}</span>}
            </div>
            <p className="text-sm text-muted-foreground">
                Al hacer clic en el botón, el sistema asignará a cada participante un "amigo secreto" de forma aleatoria. Asegúrate de que todos los usuarios se hayan registrado antes de proceder. Este proceso es irreversible para este intercambio.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleDraw} disabled={isDrawing || isLoadingUsers || participantCount < 2} className="w-full">
              {isDrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PartyPopper className="mr-2 h-4 w-4" />}
              Realizar Sorteo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
