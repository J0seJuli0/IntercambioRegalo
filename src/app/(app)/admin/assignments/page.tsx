'use client';
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExchangeParticipant, User } from "@/lib/types";
import { ArrowRight, Users } from "lucide-react";
import { useMemo } from "react";

export default function AssignmentsPage() {
  const firestore = useFirestore();

  const exchange = { id: "global-exchange" };

  const assignmentsQuery = useMemoFirebase(
    () => {
      if (!firestore) return null;
      // Correctly query the subcollection
      return collection(firestore, `giftExchanges/${exchange.id}/participants`);
    },
    [firestore, exchange.id]
  );
  const { data: assignments, isLoading: isLoadingAssignments } = useCollection<ExchangeParticipant>(assignmentsQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  const userMap = useMemo(() => {
    if (!allUsers) {
      return new Map<string, User>();
    }
    return new Map(allUsers.map(user => [user.id, user]));
  }, [allUsers]);

  const isLoading = isLoadingAssignments || isLoadingUsers;
  
  const getAvatar = (user: User | undefined) => {
    if (!user) return null;
    return user.profilePictureUrl || `https://avatar.vercel.sh/${user.id}.png`;
  }
  
  const getFallback = (user: User | undefined) => {
    if (!user) return '?';
    return user.name ? user.name.charAt(0) : user.email.charAt(0);
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Asignaciones del Sorteo
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-primary"/>
            Resultados del Amigo Secreto
          </CardTitle>
          <CardDescription>
            Esta es la lista completa de quién regala a quién en el intercambio actual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45%]">Quien Regala (Dádiva)</TableHead>
                <TableHead className="w-[10%] text-center"></TableHead>
                <TableHead className="w-[45%]">Quien Recibe (Amigo Secreto)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                     <TableCell className="text-center"><ArrowRight className="text-muted-foreground"/></TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : assignments && assignments.length > 0 && userMap.size > 0 ? (
                assignments.map((assignment) => {
                  const giver = userMap.get(assignment.userId);
                  const receiver = assignment.targetUserId ? userMap.get(assignment.targetUserId) : undefined;

                  // Only render if both giver and receiver are found in the map
                  if (!giver || !receiver) {
                    return null;
                  }

                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={getAvatar(giver) || undefined} />
                            <AvatarFallback>{getFallback(giver)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{giver.name}</div>
                            <div className="text-sm text-muted-foreground">{giver.email}</div>
                          </div>
                        </div>
                      </TableCell>
                       <TableCell className="text-center"><ArrowRight className="text-primary mx-auto"/></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={getAvatar(receiver) || undefined} />
                            <AvatarFallback>{getFallback(receiver)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{receiver.name}</div>
                            <div className="text-sm text-muted-foreground">{receiver.email}</div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Aún no se ha realizado ningún sorteo o no hay participantes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
