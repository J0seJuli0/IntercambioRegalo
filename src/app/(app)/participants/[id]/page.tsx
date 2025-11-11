'use client';
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { notFound } from "next/navigation";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { User } from "@/lib/types";
import Loading from "../../loading";

type ParticipantPageProps = {
  params: {
    id: string;
  };
};

export default function ParticipantWishlistPage({ params }: ParticipantPageProps) {
  const { id } = params;
  const firestore = useFirestore();
  
  const userDocRef = useMemoFirebase(() => {
    if (!id) return null;
    return doc(firestore, 'users', id);
  }, [firestore, id]);

  const { data: user, isLoading, error } = useDoc<User>(userDocRef);

  if (isLoading) {
    return <Loading />;
  }

  if (!user || error) {
    notFound();
  }

  return <WishlistClientPage user={user} isCurrentUser={false} />;
}
