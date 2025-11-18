'use client';
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { useUser } from "@/firebase";
import Loading from "../loading";

export default function MyWishlistPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <Loading />;
  }
  
  if (!user) {
    // This should be handled by the layout, but as a fallback
    return <div>Usuario no encontrado. Por favor, inicia sesión.</div>;
  }

  // The WishlistClientPage component is now responsible for fetching its own data
  // based on the userId prop. This simplifies this page and prevents rendering loops.
  return <WishlistClientPage userId={user.uid} />;
}
