'use client';
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { useUser } from "@/firebase";
import Loading from "../loading";
import type { User } from "@/lib/types";

export default function MyWishlistPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <Loading />;
  }
  
  if (!user) {
    // This should be handled by the layout, but as a fallback
    return <div>Usuario no encontrado. Por favor, inicia sesión.</div>;
  }

  // Create a User object that matches our application's type
  const appUser: User = {
    id: user.uid,
    name: user.displayName || user.email || 'Usuario',
    email: user.email || '',
    profilePictureUrl: user.photoURL
  }

  return <WishlistClientPage user={appUser} isCurrentUser={true} />;
}
