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
  receiverId: string | null;
};

export default function AdminDrawPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDrawing, setIsDrawing] = useState(false);

  const allUsersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<User>(allUsersQuery);

  const exchange = { id: "global-exchange", name: "Intercambio Navideño 2025" };

  const performDraw = (userIds: string[]): Assignment[] => {
    if (userIds.length < 2) {
      return [];
    }

    let givers = [...userIds];
    let receivers = [...userIds];

    // Shuffle arrays to ensure randomness
    givers = givers.sort(() => Math.random() - 0.5);
    receivers = receivers.sort(() => Math.random() - 0.5);

    let assignments: Assignment[] = [];
    const assignedReceivers = new Set<string>();

    for (const giverId of givers) {
      let found = false;
      for (let i = 0; i < receivers.length; i++) {
        const receiverId = receivers[i];
        if (giverId !== receiverId && !assignedReceivers.has(receiverId)) {
          assignments.push({ giverId, receiverId });
          assignedReceivers.add(receiverId);
          receivers.splice(i, 1);
          found = true;
          break;
        }
      }
       if (!found) { // Handle the last person who might only be able to draw themselves
            const swapIndex = assignments.findIndex(a => a.receiverId !== giverId);
            if (swapIndex !== -1) {
                const receiverToSwap = assignments[swapIndex].receiverId;
                const lastReceiver = receivers[0];

                if(lastReceiver) {
                     assignments[swapIndex].receiverId = lastReceiver;
                     assignments.push({ giverId, receiverId: receiverToSwap });
                     assignedReceivers.add(lastReceiver);
                } else {
                    // Fallback for the very last person if no swap is possible (should be rare)
                    assignments.push({ giverId, receiverId: null });
                }

            } else {
                 assignments.push({ giverId, receiverId: null }); // Very unlikely scenario
            }
        }
    }
    
    // Final check for self-assignments
    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].giverId === assignments[i].receiverId) {
            const nextI = (i + 1) % assignments.length;
            const temp = assignments[i].receiverId;
            assignments[i].receiverId = assignments[nextI].receiverId;
            assignments[nextI].receiverId = temp;
        }
    }

    return assignments.filter(a => a.receiverId != null); // Filter out any failed assignments
  };

  const handleDraw = async () => {
    if (!allUsers || allUsers.length < 2) {
      toast({ variant: "destructive", title: "No hay suficientes usuarios", description: "Se necesitan al menos 2 participantes para el sorteo." });
      return;
    }
    setIsDrawing(true);
    try {
      const userIds = allUsers.map(u => u.id);
      const assignments = performDraw(userIds);

      if (assignments.length === 0) {
        throw new Error("No se pudieron generar las asignaciones.");
      }

      // Save assignments to Firestore
      for (const assignment of assignments) {
        if (assignment.giverId && assignment.receiverId) {
           const participantRef = doc(firestore, `giftExchanges/${exchange.id}/participants/${assignment.giverId}`);
           setDocumentNonBlocking(participantRef, {
             userId: assignment.giverId,
             giftExchangeId: exchange.id,
             id: assignment.giverId,
             targetUserId: assignment.receiverId,
           }, { merge: true });
        }
      }
      
      toast({ title: "¡Sorteo Realizado!", description: "Las asignaciones se han guardado con éxito." });

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
