'use server';
import { ai } from "@/ai/genkit";
import * as genkitNext from "@genkit-ai/next";
import "@/ai/dev";

export const POST = genkitNext.nextHandler(ai);
