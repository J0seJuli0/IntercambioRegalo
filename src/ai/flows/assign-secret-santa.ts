
'use server';
/**
 * @fileOverview A flow to assign Secret Santa pairs using firebase-admin.
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
  assignments: z.array(AssignmentSchema).describe('The list of assignments made.'),
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
      // Not throwing an error, just returning no assignments
      return { assignments: [] };
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
          // swap the used receiver with the last element and pop it for efficiency
          [receivers[i], receivers[receivers.length-1]] = [receivers[receivers.length-1], receivers[i]];
          receivers.pop();
          found = true;
          break;
        }
      }
      if (!found) {
        // This might happen if the only remaining receiver is the giver itself
        assignments.push({ giverId, receiverId: null });
      }
    }

    // Handle the case where the last person might not have a pair or is self-assigned
    const unassignedGivers = givers.filter(g => !assignments.some(a => a.giverId === g));
    for (const giverId of unassignedGivers) {
      // Find someone who is not already a giver's receiver
      const possibleReceivers = userIds.filter(uid => uid !== giverId && !assignedReceivers.has(uid));
      if(possibleReceivers.length > 0){
        const receiverId = possibleReceivers[Math.floor(Math.random() * possibleReceivers.length)];
        assignments.push({ giverId, receiverId });
        assignedReceivers.add(receiverId);
      } else {
        assignments.push({ giverId, receiverId: null });
      }
    }
    
    // --- Save Assignments to Firestore using Admin SDK ---
    const batch = firestore.batch();
    
    // Create new assignments
    for (const assignment of assignments) {
      if (assignment.receiverId) {
        const participantRef = firestore.doc(`giftExchanges/${exchangeId}/participants/${assignment.giverId}`);
        batch.set(participantRef, {
            userId: assignment.giverId,
            giftExchangeId: exchangeId,
            targetUserId: assignment.receiverId
        }, { merge: true });
      }
    }

    await batch.commit();

    return { assignments };
  }
);
