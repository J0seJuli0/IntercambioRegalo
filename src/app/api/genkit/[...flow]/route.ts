'use server';
import { ai } from "@/ai/genkit";
import { nextHandler } from "@genkit-ai/next";
import "@/ai/dev";

export const POST = nextHandler(ai);
