'use client';
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
// import { getUserById, getWishlistByUserId } from "@/lib/mock-data";
import { notFound } from "next/navigation";

type ParticipantPageProps = {
  params: {
    id: string;
  };
};

export default function ParticipantWishlistPage({ params }: ParticipantPageProps) {
  const { id } = params;
  // TODO: Replace with real data from Firestore
  // const user = getUserById(id);
  // const wishlist = getWishlistByUserId(id);

  const user = { id: '1', name: 'Ana', email: 'ana@example.com' };
  const wishlist: any[] = [];

  if (!user) {
    notFound();
  }

  return <WishlistClientPage user={user} wishlist={wishlist} isCurrentUser={false} />;
}
