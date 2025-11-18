'use server';
/**
 * @fileOverview A flow to create a Firebase user and a corresponding Firestore document.
 *
 * - createUser - A function that handles the user creation process on the server.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Using explicit config to avoid environment issues with applicationDefault()
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  } catch (e) {
    console.error('Firebase Admin initialization error', e);
  }
}

const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string(),
  tipo_user: z.number().min(1).max(2),
});

const CreateUserOutputSchema = z.object({
  uid: z.string().optional(),
  error: z.string().optional(),
});

type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;

export async function createUser(input: CreateUserInput): Promise<CreateUserOutput> {
    return createUserFlow(input);
}


const createUserFlow = ai.defineFlow(
  {
    name: 'createUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async (input) => {
    // Ensure admin is initialized before proceeding
    if (!admin.apps.length) {
       return { error: 'Firebase Admin SDK not initialized.' };
    }
    
    try {
      // Step 1: Create the user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
      });

      // Step 2: Create the user document in Firestore
      const userRef = admin.firestore().collection('users').doc(userRecord.uid);
      await userRef.set({
        id: userRecord.uid,
        name: input.displayName,
        email: input.email,
        profilePictureUrl: null,
        tipo_user: input.tipo_user,
      });

      return { uid: userRecord.uid };
    } catch (error: any) {
      console.error('Error creating user:', error);
      // Return a structured error to the client
      return { error: error.code || 'An unknown error occurred' };
    }
  }
);
