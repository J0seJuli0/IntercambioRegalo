'use client';
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { useUser } from "@/firebase";
import Loading from "../loading";

export default function MyWishlistPage() {
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();

  if (isAuthUserLoading) {
    return <Loading />;
  }
  
  if (!authUser) {
    // This should be handled by the layout, but as a fallback
    return <div>Usuario no encontrado. Por favor, inicia sesión.</div>;
  }

  // Pass the user's ID to the client page.
  // WishlistClientPage will now handle fetching all necessary data.
  return <WishlistClientPage userId={authUser.uid} />;
}
