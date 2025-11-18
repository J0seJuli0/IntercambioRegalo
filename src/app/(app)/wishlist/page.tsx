'use client';
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { useUser } from "@/firebase";
import Loading from "../loading";

export default function MyWishlistPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <Loading />;
  }
  
  // This check prevents rendering WishlistClientPage with an undefined userId
  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
            <h2 className="mt-4 text-2xl font-bold">Usuario no encontrado</h2>
            <p className="mt-2 text-muted-foreground">Por favor, inicia sesión para ver tu lista de deseos.</p>
        </div>
    );
  }

  // Only render when we are sure user object with uid is available.
  return <WishlistClientPage userId={user.uid} />;
}
