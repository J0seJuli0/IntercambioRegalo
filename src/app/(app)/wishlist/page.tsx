'use client';
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { useDoc, useFirestore, useUser } from "@/firebase";
import Loading from "../loading";
import { useMemoFirebase } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";

export default function MyWishlistPage() {
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  if (isAuthUserLoading || isProfileLoading) {
    return <Loading />;
  }
  
  if (!authUser || !userProfile) {
    // This should be handled by the layout, but as a fallback
    return <div>Usuario no encontrado. Por favor, inicia sesión.</div>;
  }

  // Pass the full user profile object to the client page
  return <WishlistClientPage user={userProfile} isCurrentUser={true} />;
}
