'use server';

/**
 * @fileOverview A gift suggestion AI agent.
 *
 * - suggestGiftIdeas - A function that suggests gift ideas.
 * - SuggestGiftIdeasInput - The input type for the suggestGiftIdeas function.
 * - SuggestGiftIdeasOutput - The return type for the suggestGiftIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestGiftIdeasInputSchema = z.object({
  wishlistItems: z
    .array(z.string())
    .describe('A list of items in the recipient user wishlist.'),
  userInterests: z
    .string()
    .describe('A description of the recipient user interests.'),
});
export type SuggestGiftIdeasInput = z.infer<typeof SuggestGiftIdeasInputSchema>;

const SuggestGiftIdeasOutputSchema = z.object({
  giftIdeas: z
    .array(z.string())
    .describe('A list of suggested gift ideas.'),
});
export type SuggestGiftIdeasOutput = z.infer<typeof SuggestGiftIdeasOutputSchema>;

export async function suggestGiftIdeas(input: SuggestGiftIdeasInput): Promise<SuggestGiftIdeasOutput> {
  return suggestGiftIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestGiftIdeasPrompt',
  input: {schema: SuggestGiftIdeasInputSchema},
  output: {schema: SuggestGiftIdeasOutputSchema},
  prompt: `You are a gift suggestion expert.

You will receive a list of items from a wishlist and the general interests of a person. You will suggest gift ideas based on this information.

Wishlist Items: {{#each wishlistItems}}- {{{this}}}\n{{/each}}

User Interests: {{{userInterests}}}

Suggest some gift ideas:
`, // Fixed: added closing backtick
});

const suggestGiftIdeasFlow = ai.defineFlow(
  {
    name: 'suggestGiftIdeasFlow',
    inputSchema: SuggestGiftIdeasInputSchema,
    outputSchema: SuggestGiftIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
