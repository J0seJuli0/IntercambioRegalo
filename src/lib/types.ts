export type User = {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string | null;
  interests?: string;
};

export type Gift = {
  id: string;
  userId: string;
  name: string;
  description: string;
  link?: string;
  imageUrl?: string;
  approximatePrice?: string;
  isPurchased: boolean;
};

export type Wishlist = {
  userId: string;
  items: Gift[];
};

export type SecretSantaAssignment = {
  giverId: string;
  receiverId: string;
};
