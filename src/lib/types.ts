export type User = {
  id: string;
  name: string;
  email: string;
};

export type Gift = {
  id: string;
  name: string;
  description: string;
  link?: string;
  approximatePrice?: string;
  isPurchased: boolean;
  image?: string;
};

export type Wishlist = {
  userId: string;
  items: Gift[];
};

export type SecretSantaAssignment = {
  giverId: string;
  receiverId: string;
};
