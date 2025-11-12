import { Timestamp } from 'firebase/firestore';

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

export type ExchangeParticipant = {
  id: string; // This is the user's ID, who is the giver
  giftExchangeId: string;
  userId: string;
  targetUserId: string | null; // The person they are giving a gift to
  giverId: string;
  receiverId: string;
};

export type SecretSantaAssignment = {
  giverId: string;
  receiverId: string;
};


export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderProfilePictureUrl?: string | null;
  content: string;
  timestamp: Timestamp;
  recipientId?: string | null;
  giftExchangeId?: string;
};
