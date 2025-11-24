import { ai } from "@/ai/genkit";
// Use require for compatibility with some build environments like Vercel.
const { nextHandler } = require("@genkit-ai/next");
import "@/ai/dev";

export const POST = nextHandler(ai);
