import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";
import { getUserById, getWishlistByUserId } from "@/lib/mock-data";
import { notFound } from "next/navigation";

type ParticipantPageProps = {
  params: {
    id: string;
  };
};

export default async function ParticipantWishlistPage({ params }: ParticipantPageProps) {
  const { id } = params;
  const user = getUserById(id);
  const wishlist = getWishlistByUserId(id);

  if (!user) {
    notFound();
  }

  return <WishlistClientPage user={user} wishlist={wishlist} isCurrentUser={false} />;
}
