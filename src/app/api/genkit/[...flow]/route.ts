import { genkit } from "@/ai/genkit";
import { nextHandler } from "@genkit-ai/next";
import "@/ai/flows/suggest-gift-ideas";
import "@/ai/flows/generate-wishlist-from-description";

export const POST = nextHandler(genkit);
