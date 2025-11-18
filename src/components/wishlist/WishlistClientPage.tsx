'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit, Link as LinkIcon, DollarSign, Gift, User as UserIcon } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';

import type { Gift as GiftType, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AddGiftDialog, NewGift } from './AddGiftDialog';
import AIGiftSuggester from '../ai/AIGiftSuggester';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Loading from '@/app/(app)/loading';

type WishlistClientPageProps = {
  user: User;
  isCurrentUser: boolean;
};

export function WishlistClientPage({ user, isCurrentUser }: WishlistClientPageProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentUser } = useUser();

  const [isAddGiftOpen, setAddGiftOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftType | null>(null);

  const wishlistCollectionRef = useMemoFirebase(() => collection(firestore, `users/${user.id}/wishlistItems`), [firestore, user.id]);
  const { data: wishlist, isLoading: isWishlistLoading } = useCollection<GiftType>(wishlistCollectionRef);

  const handleAddGift = () => {
    setEditingGift(null);
    setAddGiftOpen(true);
  };
  
  const handleEditGift = (gift: GiftType) => {
    setEditingGift(gift);
    setAddGiftOpen(true);
  };

  const handleAddOrUpdateGift = (giftData: NewGift | GiftType) => {
    if (!wishlistCollectionRef || !user) return;

    try {
      if ('id' in giftData) { // Existing gift
        const giftRef = doc(firestore, `users/${user.id}/wishlistItems`, giftData.id);
        updateDocumentNonBlocking(giftRef, { ...giftData });
        toast({ title: '¡Regalo actualizado!', description: `${giftData.name} ha sido actualizado en tu lista.` });
      } else { // New gift
        addDocumentNonBlocking(wishlistCollectionRef, { ...giftData, isPurchased: false, userId: user.id });
        toast({ title: '¡Regalo añadido!', description: `${giftData.name} ha sido añadido a tu lista.` });
      }
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Error al guardar', description: error.message });
    }
  };

  const handleDeleteGift = (giftId: string) => {
     if (!user) return;
     try {
       const giftRef = doc(firestore, `users/${user.id}/wishlistItems`, giftId);
       deleteDocumentNonBlocking(giftRef);
       toast({ title: 'Regalo eliminado', description: 'El regalo ha sido eliminado de tu lista.' });
     } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
     }
  };
  
  const handleTogglePurchased = (gift: GiftType) => {
    if (!user || !currentUser) return;
    try {
      const giftRef = doc(firestore, `users/${user.id}/wishlistItems`, gift.id);
      updateDocumentNonBlocking(giftRef, { 
        isPurchased: !gift.isPurchased,
        purchasedBy: !gift.isPurchased ? currentUser.uid : null
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
    }
  };
  
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <Card>
          <CardHeader className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src={user.profilePictureUrl || `https://avatar.vercel.sh/${user.id}.png`} data-ai-hint="person face" />
                <AvatarFallback className="text-4xl">
                  {user.name ? user.name.charAt(0) : <UserIcon/>}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl font-headline">{user.name}</CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
              </div>
          </CardHeader>
          {user.interests && (
            <CardContent className="text-center">
              <p className="text-muted-foreground italic">"{user.interests}"</p>
            </CardContent>
          )}
        </Card>

      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 mb-4">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            {isCurrentUser ? 'Mi Lista de Deseos' : `Lista de Deseos de ${user.name}`}
          </h2>
          <div className="flex gap-2">
            {isCurrentUser ? (
              <Button onClick={handleAddGift}>
                <Plus className="mr-2 h-4 w-4" /> Añadir Regalo
              </Button>
            ) : (
              <AIGiftSuggester wishlistItems={wishlist?.map(i => i.name) || []} userInterests={user.interests || ''} />
            )}
          </div>
        </div>

        {isWishlistLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                  </CardContent>
                  <CardFooter className="p-4 bg-gray-50 dark:bg-gray-800">
                    <Skeleton className="h-8 w-32" />
                  </CardFooter>
              </Card>
            ))}
          </div>
        ) : wishlist && wishlist.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((gift) => {
              const giftImage = { imageUrl: `https://picsum.photos/seed/${gift.id}/400/300`, description: gift.name, imageHint: 'gift' };
              return (
                <Card key={gift.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105 duration-300">
                  <CardHeader className="p-0">
                    <Image
                      src={gift.imageUrl || giftImage.imageUrl}
                      alt={gift.description}
                      data-ai-hint={giftImage.imageHint}
                      width={400}
                      height={300}
                      className="object-cover w-full aspect-[4/3]"
                    />
                  </CardHeader>
                  <CardContent className="p-4 flex-1">
                    <CardTitle className="text-lg font-headline mb-2">{gift.name}</CardTitle>
                    <CardDescription>{gift.description}</CardDescription>
                    <div className="flex items-center gap-4 text-sm mt-4 text-muted-foreground">
                      {gift.approximatePrice && <div className="flex items-center gap-1"><DollarSign className="size-4" /><span>{gift.approximatePrice}</span></div>}
                      {gift.link && <a href={gift.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><LinkIcon className="size-4" /><span>Tienda</span></a>}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 bg-gray-50 dark:bg-gray-800">
                    {isCurrentUser ? (
                      <div className="w-full flex justify-end items-center gap-2">
                          {gift.isPurchased && <Badge variant="secondary">Comprado</Badge>}
                          <Button variant="ghost" size="icon" onClick={() => handleEditGift(gift)}><Edit className="size-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteGift(gift.id)}><Trash2 className="size-4" /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`purchased-${gift.id}`} checked={gift.isPurchased} onCheckedChange={() => handleTogglePurchased(gift)} disabled={gift.isPurchased && gift.purchasedBy !== currentUser?.uid } />
                        <Label htmlFor={`purchased-${gift.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {gift.isPurchased ? 'Comprado' : 'Marcar como comprado'}
                        </Label>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">
              {isCurrentUser ? 'Tu lista de deseos está vacía' : 'Esta lista de deseos está vacía'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isCurrentUser ? '¡Añade algunos regalos para que tu amigo secreto sepa qué te gustaría!' : 'Parece que esta persona es un misterio.'}
            </p>
            {isCurrentUser && (
              <div className="mt-6 flex justify-center gap-2">
                <Button onClick={handleAddGift}>
                  <Plus className="mr-2 h-4 w-4" /> Añadir Regalo
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <AddGiftDialog 
        isOpen={isAddGiftOpen} 
        setOpen={setAddGiftOpen} 
        onSave={handleAddOrUpdateGift}
        gift={editingGift}
      />
    </div>
  );
}
