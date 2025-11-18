'use client';
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { notFound, useParams } from "next/navigation";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import type { User } from "@/lib/types";
import Loading from "../../loading";

export default function ParticipantWishlistPage() {
  const params = useParams();
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const id = params.id as string;

  const userDocRef = useMemoFirebase(() => {
    if (!id || !firestore) return null;
    return doc(firestore, 'users', id);
  }, [firestore, id]);

  const { data: user, isLoading, error } = useDoc<User>(userDocRef);
  
  if (isLoading) {
    return <Loading />;
  }

  if (error || !user) {
    // If there's an error fetching or the user doesn't exist, show a 404 page.
    notFound();
  }
  
  // This check ensures 'user' is not null before proceeding.
  const isCurrentUserPage = currentUser?.uid === user.id;

  // The 'user' object is now guaranteed to be available here.
  return <WishlistClientPage user={user} isCurrentUser={isCurrentUserPage} />;
}
