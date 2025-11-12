'use client';
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { notFound, useParams } from "next/navigation";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { User } from "@/lib/types";
import Loading from "../../loading";

export default function ParticipantWishlistPage() {
  const params = useParams();
  const { user: currentUser } = useUser();
  const id = params.id as string;
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
  
  const isCurrentUserPage = currentUser?.uid === user.id;

  return <WishlistClientPage user={user} isCurrentUser={isCurrentUserPage} />;
}
