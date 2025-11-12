
'use server';
/**
 * @fileOverview A flow to assign Secret Santa pairs and save them to Firestore.
 *
 * - assignSecretSanta - A function that takes user IDs and assigns pairs.
 * - AssignSecretSantaInput - The input type for the assignSecret-santa function.
 * - AssignSecretSantaOutput - The return type for the assignSecretSanta function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}
const firestore = admin.firestore();


const AssignSecretSantaInputSchema = z.object({
  userIds: z.array(z.string()).describe('A list of user IDs to be paired up.'),
  exchangeId: z.string().describe('The ID of the gift exchange.'),
});
export type AssignSecretSantaInput = z.infer<typeof AssignSecretSantaInputSchema>;

const AssignmentSchema = z.object({
  giverId: z.string(),
  receiverId: z.string().nullable(),
});
export type Assignment = z.infer<typeof AssignmentSchema>;

const AssignSecretSantaOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type AssignSecretSantaOutput = z.infer<typeof AssignSecretSantaOutputSchema>;


export async function assignSecretSanta(input: AssignSecretSantaInput): Promise<AssignSecretSantaOutput> {
  return assignSecretSantaFlow(input);
}

const assignSecretSantaFlow = ai.defineFlow(
  {
    name: 'assignSecretSantaFlow',
    inputSchema: AssignSecretSantaInputSchema,
    outputSchema: AssignSecretSantaOutputSchema,
  },
  async ({ userIds, exchangeId }) => {
    // Basic validation
    if (userIds.length < 2) {
      return { success: false, message: "Se necesitan al menos 2 participantes." };
    }

    // --- The Draw Logic ---
    let givers = [...userIds];
    let receivers = [...userIds];

    // Shuffle arrays to ensure randomness
    givers = givers.sort(() => Math.random() - 0.5);
    receivers = receivers.sort(() => Math.random() - 0.5);

    let assignments: Assignment[] = [];
    let assignedReceivers = new Set<string>();

    for (const giverId of givers) {
      let found = false;
      for (let i = 0; i < receivers.length; i++) {
        const receiverId = receivers[i];
        if (giverId !== receiverId && !assignedReceivers.has(receiverId)) {
          assignments.push({ giverId, receiverId });
          assignedReceivers.add(receiverId);
          receivers.splice(i, 1);
          found = true;
          break;
        }
      }
      if (!found) {
        // Handle the case where a user is left and can only be assigned to themself
        const remainingReceiver = receivers.find(r => !assignedReceivers.has(r));
        if (remainingReceiver) {
           // This is a tricky situation. Find someone to swap with.
           // Find an assignment where the receiver is not the current giver
           const swapIndex = assignments.findIndex(a => a.receiverId !== giverId);
           if (swapIndex !== -1) {
             const tempReceiver = assignments[swapIndex].receiverId;
             assignments[swapIndex].receiverId = remainingReceiver;
             assignments.push({ giverId, receiverId: tempReceiver });
             assignedReceivers.add(remainingReceiver);
           } else {
             // Highly unlikely edge case, but we'll assign null for now
             assignments.push({ giverId, receiverId: null });
           }
        } else {
          assignments.push({ giverId, receiverId: null });
        }
      }
    }
    
    // Final check for self-assignments (can happen in small groups)
    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].giverId === assignments[i].receiverId) {
            // Swap with the next person's receiver
            const nextIndex = (i + 1) % assignments.length;
            const temp = assignments[i].receiverId;
            assignments[i].receiverId = assignments[nextIndex].receiverId;
            assignments[nextIndex].receiverId = temp;
        }
    }
    
    // --- Firestore Write Logic ---
    try {
      const batch = firestore.batch();
      for (const assignment of assignments) {
        if (assignment.giverId && assignment.receiverId) {
          const participantRef = firestore.doc(`giftExchanges/${exchangeId}/participants/${assignment.giverId}`);
          batch.set(participantRef, {
            userId: assignment.giverId,
            giftExchangeId: exchangeId,
            id: assignment.giverId,
            targetUserId: assignment.receiverId,
          }, { merge: true });
        }
      }
      await batch.commit();
      return { success: true, message: "Sorteo realizado y guardado con éxito." };
    } catch (error: any) {
        console.error("Firestore batch write error:", error);
        return { success: false, message: `Error al guardar en la base de datos: ${error.message}` };
    }
  }
);
