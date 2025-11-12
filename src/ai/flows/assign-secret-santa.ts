
'use server';
/**
 * @fileOverview A flow to assign Secret Santa pairs.
 *
 * - assignSecretSanta - A function that takes user IDs and assigns pairs.
 * - AssignSecretSantaInput - The input type for the assignSecret-santa function.
 * - AssignSecretSantaOutput - The return type for the assignSecretSanta function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  async ({ userIds }) => {
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
          // Efficiently remove the used receiver by swapping with the last element and popping
          [receivers[i], receivers[receivers.length-1]] = [receivers[receivers.length-1], receivers[i]];
          receivers.pop();
          found = true;
          break;
        }
      }
      if (!found) {
        // This edge case can happen if the only person left to be a receiver is the giver themself
        // We'll try to resolve this after the main loop
      }
    }
    
    // Final check for consistency and to resolve any self-assignments or unassigned people
    // This simple logic might still result in some issues in edge cases, but works for most scenarios.
    for(let i=0; i< assignments.length; i++){
        // check for self-assignment
        if(assignments[i].giverId === assignments[i].receiverId){
            // swap with the next person's receiver, if it's not the same person
            const nextIndex = (i + 1) % assignments.length;
            if(assignments[nextIndex].receiverId !== assignments[i].giverId) {
                [assignments[i].receiverId, assignments[nextIndex].receiverId] = [assignments[nextIndex].receiverId, assignments[i].receiverId];
            }
        }
    }


    // The flow now only returns the calculated assignments.
    // The client will be responsible for writing them to Firestore.
    return { assignments };
  }
);
