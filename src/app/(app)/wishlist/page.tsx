import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { currentUserId, getUserById, getWishlistByUserId } from "@/lib/mock-data";

export default async function MyWishlistPage() {
  // In a real app, you'd get the user ID from the session
  const user = getUserById(currentUserId);
  const wishlist = getWishlistByUserId(currentUserId);

  if (!user) {
    // Handle user not found, maybe redirect to login
    return <div>User not found.</div>;
  }

  return <WishlistClientPage user={user} wishlist={wishlist} isCurrentUser={true} />;
}
