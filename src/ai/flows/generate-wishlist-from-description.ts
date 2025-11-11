'use server';
/**
 * @fileOverview Generates a detailed wishlist based on a user-provided description.
 *
 * - generateWishlist - A function that handles the wishlist generation process.
 * - GenerateWishlistInput - The input type for the generateWishlist function.
 * - GenerateWishlistOutput - The return type for the generateWishlist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWishlistInputSchema = z.object({
  description: z.string().describe('A general description of the types of gifts the user would like to receive.'),
});
export type GenerateWishlistInput = z.infer<typeof GenerateWishlistInputSchema>;

const GenerateWishlistOutputSchema = z.object({
  wishlistItems: z.array(
    z.object({
      name: z.string().describe('The name of the gift.'),
      description: z.string().describe('A more detailed description of the gift, including potential uses.'),
      approximatePrice: z.string().describe('The approximate price range of the gift, e.g., \"$20-$30\", or \"under $50\".'),
      link: z.string().optional().describe('A link to where the gift can be purchased online, if available.'),
    })
  ).describe('A list of gift ideas generated from the description.'),
});
export type GenerateWishlistOutput = z.infer<typeof GenerateWishlistOutputSchema>;

export async function generateWishlist(input: GenerateWishlistInput): Promise<GenerateWishlistOutput> {
  return generateWishlistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWishlistPrompt',
  input: {schema: GenerateWishlistInputSchema},
  output: {schema: GenerateWishlistOutputSchema},
  prompt: `You are a helpful shopping assistant who specializes in generating detailed wishlists from general descriptions.

  Based on the following description, please generate a list of gift ideas. Each gift idea should include the name of the gift, a more detailed description including potential uses, the approximate price range, and a link to where the gift can be purchased online if available.
  Description: {{{description}}}
  
  Format your response as a JSON array of gift objects.
  `,
});

const generateWishlistFlow = ai.defineFlow(
  {
    name: 'generateWishlistFlow',
    inputSchema: GenerateWishlistInputSchema,
    outputSchema: GenerateWishlistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
