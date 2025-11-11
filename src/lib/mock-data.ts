import type { User, Gift, SecretSantaAssignment } from './types';

// This file is now deprecated. Data will be fetched from Firestore.

export const users: User[] = [];

export const wishlists: Record<string, Gift[]> = {};

export const assignments: SecretSantaAssignment[] = [];

export const currentUserId = '';

// Mock functions to simulate database access
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getWishlistByUserId = (id: string) => wishlists[id] || [];
export const getAssignmentForGiver = (id: string) => assignments.find(a => a.giverId === id);
