'use server';
/**
 * @fileOverview A flow to assign Secret Santa pairs.
 *
 * - assignSecretSanta - A function that takes user IDs and assigns pairs.
 * - AssignSecretSantaInput - The input type for the assignSecretSanta function.
 * - AssignSecretSantaOutput - The return type for the assignSecretSanta function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, query } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// Initialize Firebase Admin for server-side operations
const { firestore } = initializeFirebase();

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
    const givers = [...userIds];
    const receivers = [...userIds];

    // Shuffle both arrays to ensure randomness
    for (let i = givers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [givers[i], givers[j]] = [givers[j], givers[i]];
        [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }
    
    const assignments: Assignment[] = [];
    const assignedReceivers = new Set<string>();

    for (const giverId of givers) {
        let potentialReceiver: string | undefined;

        for (let i = 0; i < receivers.length; i++) {
            const receiverId = receivers[i];
            // Find a receiver who is not the giver and has not been assigned yet
            if (receiverId !== giverId && !assignedReceivers.has(receiverId)) {
                potentialReceiver = receiverId;
                break;
            }
        }
        
        if (potentialReceiver) {
             assignments.push({ giverId, receiverId: potentialReceiver });
             assignedReceivers.add(potentialReceiver);
        } else {
            // This can happen if the last remaining receiver is the giver themselves,
            // or if we're at the end with an odd number of users.
             assignments.push({ giverId, receiverId: null });
        }
    }
    
    // Fallback for the last person if they are assigned to themselves
    // This is a simple circular shift to fix the last assignment if it's self-assigned
    const lastAssignment = assignments[assignments.length-1];
    if(lastAssignment && lastAssignment.giverId === lastAssignment.receiverId) {
        // Swap with the first person's receiver
        const firstReceiver = assignments[0].receiverId;
        assignments[assignments.length - 1].receiverId = firstReceiver;
        assignments[0].receiverId = lastAssignment.giverId;
    }


    // --- Save Assignments to Firestore ---
    const exchangeParticipantsRef = collection(firestore, `giftExchanges/${exchangeId}/participants`);
    
    // Clear previous assignments for this exchange
    const q = query(exchangeParticipantsRef);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
        await setDoc(document.ref, { targetUserId: null }, { merge: true });
    });


    // Create new assignments
    for (const assignment of assignments) {
        if (assignment.receiverId) {
            const participantRef = doc(firestore, `giftExchanges/${exchangeId}/participants`, assignment.giverId);
             // Using setDoc with merge to either create or update the participant doc
            await setDoc(participantRef, {
                userId: assignment.giverId,
                giftExchangeId: exchangeId,
                targetUserId: assignment.receiverId
            }, { merge: true });
        }
    }

    return { assignments };
  }
);
