'use client';
import { useState } from "react";
import { useCollection, useFirestore, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc, getDocs } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PartyPopper, Users, Shuffle, Trash2 } from "lucide-react";
import type { User, ExchangeParticipant } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Type for the assignment object
type Assignment = {
  giverId: string;
  receiverId: string;
};

export default function AdminDrawPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const allUsersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<User>(allUsersQuery);
  
  const exchange = { id: "global-exchange", name: "Intercambio Navideño 2025" };

  const assignmentsQuery = useMemoFirebase(
    () => collection(firestore, `giftExchanges/${exchange.id}/participants`),
    [firestore, exchange.id]
  );
  const { data: assignments, isLoading: isLoadingAssignments } = useCollection<ExchangeParticipant>(assignmentsQuery);


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

   const handleDeleteAssignments = async () => {
    setIsDeleting(true);
    try {
      if (!assignmentsQuery) throw new Error("Database reference not available.");
      
      const querySnapshot = await getDocs(assignmentsQuery);
      if(querySnapshot.empty) {
        toast({ title: "No hay nada que borrar", description: "No se encontraron asignaciones para eliminar." });
        setIsDeleting(false);
        return;
      }
      
      for (const document of querySnapshot.docs) {
        deleteDocumentNonBlocking(document.ref);
      }
      
      toast({ title: "¡Asignaciones Eliminadas!", description: `Se han reiniciado las ${querySnapshot.size} asignaciones del sorteo.` });

    } catch (error) {
      console.error("Delete assignments error:", error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo completar la eliminación.";
      toast({ variant: "destructive", title: "Error al eliminar", description: errorMessage });
    } finally {
      setIsDeleting(false);
    }
  };

  const participantCount = allUsers?.length || 0;
  const assignmentCount = assignments?.length || 0;
  const isLoading = isLoadingUsers || isLoadingAssignments;

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
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                 <PartyPopper className="h-6 w-6 text-muted-foreground"/>
                 <span className="font-medium">Asignaciones Actuales</span>
              </div>
              {isLoadingAssignments ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="text-2xl font-bold">{assignmentCount}</span>}
            </div>
            <p className="text-sm text-muted-foreground">
                Al hacer clic en "Realizar Sorteo", el sistema asignará a cada participante un amigo secreto. Asegúrate de que todos se hayan registrado. Si necesitas empezar de nuevo, puedes usar "Reiniciar Sorteo".
            </p>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-4">
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting || isLoading || assignmentCount === 0}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Reiniciar Sorteo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente todas las asignaciones actuales del amigo secreto. Los participantes ya no sabrán a quién deben regalar. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAssignments}>Sí, reiniciar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleDraw} disabled={isDrawing || isLoading || participantCount < 2}>
              {isDrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PartyPopper className="mr-2 h-4 w-4" />}
              Realizar Sorteo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
