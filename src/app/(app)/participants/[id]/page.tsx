'use client';
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { useParams } from "next/navigation";

export default function ParticipantWishlistPage() {
  const params = useParams();
  const id = params.id as string;

  // The WishlistClientPage component is now responsible for fetching its own data
  // based on the userId prop. This simplifies this page and prevents rendering loops.
  return <WishlistClientPage userId={id} />;
}
