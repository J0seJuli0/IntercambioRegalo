'use client';
import { useState } from "react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ParticipantsPage() {
  const firestore = useFirestore();
  const { data: users, isLoading } = useCollection<User>(collection(firestore, 'users'));
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users?.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Participantes
        </h2>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o correo..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </CardHeader>
          </Card>
        ))}
        {filteredUsers && filteredUsers.map((user) => (
          <Link href={`/participants/${user.id}`} key={user.id}>
            <Card className="hover:shadow-lg hover:border-primary transition-all duration-200">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                   <AvatarImage src={user.profilePictureUrl || `https://avatar.vercel.sh/${user.id}.png`} data-ai-hint="person face" />
                  <AvatarFallback>{user.name ? user.name.charAt(0) : user.email.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{user.name || 'Usuario Anónimo'}</CardTitle>
                  <CardDescription className="text-sm">{user.email}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
       {!isLoading && filteredUsers?.length === 0 && (
         <div className="text-center py-16 col-span-full">
            <p className="text-muted-foreground">No se encontraron participantes.</p>
         </div>
       )}
    </div>
  );
}
