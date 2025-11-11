export type User = {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string | null;
  interests?: string;
  tipo_user: 1 | 2; // 1: user, 2: admin
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
  purchasedBy?: string;
};

export type Wishlist = {
  userId: string;
  items: Gift[];
};

export type SecretSantaAssignment = {
  giverId: string;
  receiverId: string;
};
