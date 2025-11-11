'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Sparkles, Trash2, Edit, Link as LinkIcon, DollarSign } from 'lucide-react';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';

import type { Gift, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AddGiftDialog, NewGift } from './AddGiftDialog';
import { GenerateWishlistDialog } from '@/components/ai/GenerateWishlistDialog';
import AIGiftSuggester from '../ai/AIGiftSuggester';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

type WishlistClientPageProps = {
  user: User;
  isCurrentUser: boolean;
};

export function WishlistClientPage({ user, isCurrentUser }: WishlistClientPageProps) {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const [isAddGiftOpen, setAddGiftOpen] = useState(false);
  const [isGenerateAIOpen, setGenerateAIOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);

  const wishlistCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.id}/wishlistItems`);
  }, [firestore, user]);

  const { data: wishlist, isLoading: isWishlistLoading } = useCollection<Gift>(wishlistCollectionRef);

  const handleAddGift = () => {
    setEditingGift(null);
    setAddGiftOpen(true);
  };
  
  const handleEditGift = (gift: Gift) => {
    setEditingGift(gift);
    setAddGiftOpen(true);
  };

  const handleAddOrUpdateGift = async (giftData: NewGift | Gift) => {
    if (!wishlistCollectionRef) return;

    try {
      if ('id' in giftData) { // Existing gift
        const giftRef = doc(firestore, `users/${user.id}/wishlistItems`, giftData.id);
        await updateDoc(giftRef, { ...giftData });
        toast({ title: '¡Regalo actualizado!', description: `${giftData.name} ha sido actualizado en tu lista.` });
      } else { // New gift
        await addDoc(wishlistCollectionRef, { ...giftData, isPurchased: false, userId: user.id });
        toast({ title: '¡Regalo añadido!', description: `${giftData.name} ha sido añadido a tu lista.` });
      }
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Error al guardar', description: error.message });
    }
  };

  const handleDeleteGift = async (giftId: string) => {
     if (!user) return;
     try {
       const giftRef = doc(firestore, `users/${user.id}/wishlistItems`, giftId);
       await deleteDoc(giftRef);
       toast({ title: 'Regalo eliminado', description: 'El regalo ha sido eliminado de tu lista.' });
     } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
     }
  };
  
  const handleGeneratedWishlist = async (items: NewGift[]) => {
     if (!wishlistCollectionRef) return;
     try {
       const promises = items.map(item => addDoc(wishlistCollectionRef, { ...item, isPurchased: false, userId: user.id }));
       await Promise.all(promises);
       toast({ title: '¡Lista de deseos generada!', description: 'Hemos añadido nuevas ideas a tu lista.' });
     } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error al generar', description: error.message });
     }
  };
  
  const handleTogglePurchased = async (gift: Gift) => {
    if (!user) return;
    try {
      const giftRef = doc(firestore, `users/${user.id}/wishlistItems`, gift.id);
      await updateDoc(giftRef, { isPurchased: !gift.isPurchased });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          {isCurrentUser ? 'Mi Lista de Deseos' : `Lista de ${user.name}`}
        </h2>
        <div className="flex gap-2">
          {isCurrentUser ? (
            <>
              <Button onClick={handleAddGift}>
                <Plus className="mr-2 h-4 w-4" /> Añadir Regalo
              </Button>
              <Button variant="outline" onClick={() => setGenerateAIOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" /> Generar con IA
              </Button>
            </>
          ) : (
             <AIGiftSuggester wishlistItems={wishlist?.map(i => i.name) || []} userInterests={user.interests || ''} />
          )}
        </div>
      </div>
      {isWishlistLoading ? (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
             <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-1/2 mt-1" />
                </CardContent>
                <CardFooter className="p-4">
                   <Skeleton className="h-8 w-32" />
                </CardFooter>
             </Card>
          ))}
         </div>
      ) : wishlist && wishlist.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((gift) => {
            const giftImage = { imageUrl: `https://picsum.photos/seed/${gift.id}/400/300`, description: gift.name, imageHint: 'gift' };
            return (
              <Card key={gift.id} className="flex flex-col">
                <CardHeader className="p-0">
                  <Image
                    src={gift.imageUrl || giftImage.imageUrl}
                    alt={gift.description}
                    data-ai-hint={giftImage.imageHint}
                    width={400}
                    height={300}
                    className="object-cover rounded-t-lg aspect-[4/3]"
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
                <CardFooter className="p-4 pt-0">
                  {isCurrentUser ? (
                     <div className="w-full flex justify-between items-center">
                        {gift.isPurchased && <Badge variant="secondary">Comprado</Badge>}
                        <div className="flex gap-2 ml-auto">
                          <Button variant="ghost" size="icon" onClick={() => handleEditGift(gift)}><Edit className="size-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteGift(gift.id)}><Trash2 className="size-4" /></Button>
                        </div>
                     </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`purchased-${gift.id}`} checked={gift.isPurchased} onCheckedChange={() => handleTogglePurchased(gift)} />
                      <Label htmlFor={`purchased-${gift.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Marcar como comprado
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
      <AddGiftDialog 
        isOpen={isAddGiftOpen} 
        setOpen={setAddGiftOpen} 
        onSave={handleAddOrUpdateGift}
        gift={editingGift}
      />
      <GenerateWishlistDialog 
        isOpen={isGenerateAIOpen}
        setOpen={setGenerateAIOpen}
        onGenerated={handleGeneratedWishlist}
      />
    </div>
  );
}
